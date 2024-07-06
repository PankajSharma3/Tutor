import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getStorage, ref, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const loader = document.getElementById('loader');

async function fetchSecrets() {
    try {
        const response = await fetch('/api/secrets/question', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch secrets');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching secrets:', error);
        return null;
    }
}

async function initializeAppWithSecrets() {
    loader.style.display = 'block';

    const secrets = await fetchSecrets();
    if (!secrets) {
        console.error('Secrets not available');
        loader.style.display = 'none';
        return;
    }

    const firebaseConfig = {
        apiKey: secrets.apiKey,
        authDomain: secrets.authDomain,
        projectId: secrets.projectId,
        storageBucket: secrets.storageBucket,
        messagingSenderId: secrets.messagingSenderId,
        appId: secrets.appId,
        measurementId: secrets.measurementId
    };

    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);

    function createTestCard(folderName) {
        const testListElement = document.getElementById('test-list');
        if (!testListElement) {
            console.error('Test list element not found');
            return;
        }

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
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        })
                        .catch((error) => {
                            console.error('Error getting download URL:', error);
                        });
                });
            })
            .catch((error) => {
                console.error('Error listing files in folder:', error);
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
                console.error('Error listing folders:', error);
            })
            .finally(() => {
                loader.style.display = 'none';
            });
    }
    listFolders();
}
initializeAppWithSecrets();

function checkUserDetails() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        fetch('/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ _id: user._id }) 
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                window.location.href = '/';
            } else {
                if (data.user.domain === 'Admin') {
                    window.location.href = '/';
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            window.location.href = '/'; 
        });
    } else {
        window.location.href = '/'; 
    }
}
checkUserDetails();