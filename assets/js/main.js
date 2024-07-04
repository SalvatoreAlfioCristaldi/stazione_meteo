document.addEventListener('DOMContentLoaded', () => {
    
function dati() {
    const dataList = document.getElementById('data-list');
    axios.get('http://localhost:8080/data')
        .then(response => {
            const data = response.data;
            dataList.innerHTML='';
            // Crea un elemento <li> per ogni dato e lo aggiunge alla lista
            data.forEach(item => {
            const li = document.createElement('div');
            li.classList.add('col-4');
            const li2 = document.createElement('div');
            li2.classList.add('card');
            const li3 = document.createElement('div');
            li3.classList.add('card-body');
            const li4 = document.createElement('h5');
            li4.classList.add('card-title');
            li4.innerHTML=`${item.nome}`;
            const li5 = document.createElement('h5');
            li5.classList.add('card-text');
            li5.textContent=`${item.valore}`;

            const refresh=`${item.refresh}`;

            li4.appendChild(li5);
            li3.appendChild(li4);
            li2.appendChild(li3);
            li.appendChild(li2);
            //ID: ${item.id}, Name: ${item.nome},valore: ${item.valore} `; // Modifica secondo la struttura dei tuoi dati

            const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => deleteItem(item.id, li));
                
               
                li3.appendChild(deleteButton);
                sensorElements[item] = document.getElementById(item);
                update(item.id, li5);
                setInterval( async () => {update(item.id, li5)}, (refresh*1000));
                
                
                dataList.appendChild(li);
                
        });
        
    })
    .catch(error => {
        console.error('Errore nella richiesta:', error);
    });

    
}

    
async function update(itemId, listItem) {
    const dataList = document.getElementById('data-list');
    axios.get(`http://localhost:8080/update/${itemId}`)
        .then(response => {
            const data = response.data;
            // Crea un elemento <li> per ogni dato e lo aggiunge alla lista
            data.forEach(item => {
                listItem.textContent=`${item.valore}`;
            })
    
            
        })
        .catch(error => {
            console.error('Errore nella richiesta:', error);
        });
}



function deleteItem(itemId, listItem) {
    axios.delete(`http://localhost:8080/delete/${itemId}`)
        .then(response => {
            console.log(response.data.message);
            listItem.remove(); // Rimuovi l'elemento dal DOM
        })
        .catch(error => {
            console.error('Errore nell\'eliminazione dell\'elemento:', error);
        });
}
const sensoriForm = document.getElementById('sensoriForm');

sensoriForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const no = document.getElementById('nome');
    const nome=no.value;
    const ref = document.getElementById('ref');
    const refresh = ref.value;
   

    axios.post('http://localhost:8080/new', { nome,refresh })
        .then(response => {
            console.log(response.data.message);
            const dataList = document.getElementById('data-list');
            dataList.innerHTML='';
            dati();
            no.value='';
            ref.value='';
        })
        .catch(error => {
            console.error('Errore nel login:', error.response.data.message);
            // Gestisci errori di login, ad esempio mostrando un messaggio all'utente
        });
       
});


    const login = document.getElementById('l');
    login.addEventListener('click', (event) => {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
            axios.post('http://localhost:8080/login', { username, password })
            .then(response => {
              
                console.log(response.data.message);
                // Esegui azioni dopo il login, ad esempio reindirizzamento o aggiornamento UI
                // Esempio: reindirizzamento alla dashboard dopo il login
                socket = io();

                socket.on("connect", async () => {
                dati();
                const data = document.getElementById('data-list');
                data.style.display='flex';
                const login = document.getElementById('login');
                login.style.display='none';
                const sensori = document.getElementById('sensori');
                sensori.style.display='block';



                socket.on("disconnect", () => {
                    const data = document.getElementById('data-list');
                data.style.display='none';
                const login = document.getElementById('login');
                login.style.display='block';
                const sensori = document.getElementById('sensori');
                sensori.style.display='none';
                });


            });
            })
            .catch(error => {
                console.error('Errore nel login:', error.response.data.message);
                // Gestisci errori di login, ad esempio mostrando un messaggio all'utente
            });
            
        });

        const register = document.getElementById('r');
        register.addEventListener('click', (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
            axios.post('http://localhost:8080/register', { username, password })
            .then(response => {
                console.log(response.data.message);
                // Esegui azioni dopo il login, ad esempio reindirizzamento o aggiornamento UI
                // Esempio: reindirizzamento alla dashboard dopo il login
                const login = document.getElementById('login');
                const risp=document.createElement('span');
                risp.textContent="registrato con successo";
                login.appendChild(risp);
                
            })
            .catch(error => {
                console.error('Errore nel login:', error.response.data.message);
                // Gestisci errori di login, ad esempio mostrando un messaggio all'utente
            });
            
        });


       
    });

