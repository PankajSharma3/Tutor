import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getStorage, ref, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

async function fetchSecrets() {
    try {
        const response = await fetch('/api/secrets', {
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
    const secrets = await fetchSecrets();
    if (secrets) {
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
    } else {
        console.error('Secrets not available');
    }
}

initializeAppWithSecrets();
