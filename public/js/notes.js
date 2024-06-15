import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getStorage, ref, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCcw91UT0n-Bsk5K-RpgcT8_GfkLHwRuHM",
    authDomain: "webapp-e18e6.firebaseapp.com",
    projectId: "webapp-e18e6",
    storageBucket: "webapp-e18e6.appspot.com",
    messagingSenderId: "433274195052",
    appId: "1:433274195052:web:d00f826da3b81355399c49",
    measurementId: "G-Q42Z7JVBDP"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const testListElement = document.getElementById('test-list');

function createTestCard(folderName) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.addEventListener('click', () => downloadFilesInFolder(folderName));
    const details = document.createElement('div');
    details.classList.add('test-details');

    const title = document.createElement('div');
    title.classList.add('h3');
    title.textContent = folderName;

    details.appendChild(title);
    card.appendChild(details);
    testListElement.appendChild(card);
}

function downloadFilesInFolder(folderName) {
    const folderRef = ref(storage, folderName);
    listAll(folderRef)
        .then((res) => {
            res.items.forEach((itemRef) => {
                getDownloadURL(itemRef)
                    .then((url) => {
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = itemRef.name;
                        link.click();
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            });
        })
        .catch((error) => {
            console.error(error);
        });
}

function listFolders() {
    const listRef = ref(storage);
    listAll(listRef)
        .then((res) => {
            const folderNames = new Set();
            res.prefixes.forEach((folderRef) => {
                folderNames.add(folderRef.name);
            });
            folderNames.forEach((folderName) => {
                createTestCard(folderName);
            });
        })
        .catch((error) => {
            console.error(error);
        });
}

listFolders();
