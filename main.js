import { detectType, setStorage, detectIcon } from './helpers.js';

// !html'den gelenler

const form = document.querySelector('form');
const list = document.querySelector('ul')

//! olay izleyicileri
form.addEventListener("submit", handleSubmit);
list.addEventListener("click", handleClick);

// !Ortak kullanım alanı(global değişken tanımlama)
var map; 
var notes = JSON.parse(localStorage.getItem("notes")) || [];
var coords = [];
var layerGroup = [];
console.log(notes);
//! Kullanıcının konumunu öğrenme
navigator.geolocation.getCurrentPosition(
    loadMap,
    console.log("Kullanıcı kabul etmedi")
);


// Haritaya tıklanınca çalışan fonksiyon
function onMapClick(e) {
    form.style.display = 'flex';
    coords = ([e.latlng.lat, e.latlng.lng]);
}
//! Kullanıcının konumuna göre ekrana haritayı basma
function loadMap(e) {
// Haritanın kurulumunu yapar
map = L.map('map').setView([e.coords.latitude,e.coords.longitude],
     14);

// Haritanın nasıl görüneceğini belirler
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
// Haritada ekrana basılacak imleçleri tutacağımız katman
layerGroup = L.layerGroup().addTo(map);

// Local'den gelen notları listeleme
renderNoteList(notes);
//Haritada bir tıklanma olduğunda çalışacak fonksiyon 
map.on('click', onMapClick);
}

// ekrana imleç basar
function renderMarker(item){
    // Markırı oluşturur
    L.marker(item.coords, {icon:detectIcon(item.status)})
//   İmleçlerin olduğu katmana ekler 
    .addTo(layerGroup)
    // Üzerine tıklanınca açılacak poup ekleme
    .bindPopup(`${item.desc}`);
}

// formun gönderilmesi olayınnda çalışır
function handleSubmit(e){
    e.preventDefault();
    const desc = e.target[0].value;
    const date = e.target[1].value;
    const status = e.target[2].value;
// Notlar dizisine eleman ekleme
    notes.push({ id: new Date().getTime(), desc, date, status, coords });

// Local sorageyi güncelleme
setStorage(notes);

    // NOTLARI LİSTELEME
    renderNoteList(notes);
    // Formu kapatma
    form.style.display = 'none';
}

// ekrana botları basma fonksiyonu
function renderNoteList(items){
    // Note'lar alanını temizler
    list.innerHTML = ' ';
    // imleçleri temizler
    layerGroup.clearLayers();
    // herbir note için fonksiyon çalıştırır
    items.forEach((item)=> {


        // li elemanı oluşturur
      const listEle = document.createElement("li")


    //   data'sına sahip olduğu  id'yi ekleme
   listEle.dataset.id = item.id;

    //   içeriği belirleme 
    listEle.innerHTML = 
    `
    <div>
    <p>${item.desc}</p>
    <p><span>Tarih:</span>${item.date}</p>
    <p><span>Durum:</span>${detectType(item.status)}</p>
  </div>
  <i  id='fly' class="bi bi-airplane-engines-fill"></i>
  <i id="delete" class="bi bi-trash3-fill"></i>
    
    `;
// html'deki listeye elemanı ekleme
    list.insertAdjacentElement("afterbegin", listEle);

    // Ekrana bas
    renderMarker(item)
    });
}

// Notlar alanında tıklama olayını izler
function handleClick(e){
    // Güncellenecek elemanın id'sini öğrenme 
    const id = e.target.parentElement.dataset.id;
    if (e.target.id === 'delete') {


        // id sini bildiğimiz elemanı diziden kaldırma
        notes = notes.filter((note) => note.id != id);

        // localı güncelle 
        setStorage(notes);

        // ekranı güncelle
        renderNoteList(notes);
    }

    if (e.target.id === 'fly') {
      const note = notes.find((note)=> note.id == id);
      map.flyTo(note.coords);  
    }
}



