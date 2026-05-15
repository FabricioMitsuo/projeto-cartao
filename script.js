const card = document.getElementById('creditCard');
const cardForm = document.getElementById('cardForm');
const btnClear = document.getElementById('btnClear');
const successAlert = document.getElementById('successAlert');
const storageList = document.getElementById('storageList');

// Inputs
const inputNumber = document.getElementById('inputNumber');
const inputName = document.getElementById('inputName');
const inputExpiry = document.getElementById('inputExpiry');
const inputCVV = document.getElementById('inputCVV');

// Views
const viewNumber = document.getElementById('viewNumber');
const viewName = document.getElementById('viewName');
const viewExpiry = document.getElementById('viewExpiry');
const viewCVV = document.getElementById('viewCVV');
const viewBrand = document.getElementById('viewBrand');

// Carrega os dados armazenados assim que a página abre
document.addEventListener('DOMContentLoaded', displayStoredCards);

function updateCardBrand(number) {
    const cleanNumber = number.replace(/\s/g, '');
    card.classList.remove('visa-theme', 'mastercard-theme', 'elo-theme', 'default-theme');

    if (cleanNumber.startsWith('4')) {
        card.classList.add('visa-theme');
        viewBrand.innerText = 'VISA';
        return 'VISA';
    } else if (cleanNumber.startsWith('5')) {
        card.classList.add('mastercard-theme');
        viewBrand.innerText = 'MASTERCARD';
        return 'MASTERCARD';
    } else if (cleanNumber.startsWith('6') || cleanNumber.startsWith('50')) {
        card.classList.add('elo-theme');
        viewBrand.innerText = 'ELO';
        return 'ELO';
    } else {
        card.classList.add('default-theme');
        viewBrand.innerText = cleanNumber.length > 0 ? 'CARD' : 'VISA';
        return 'OUTRA';
    }
}

// Máscaras e Sincronização viva
inputNumber.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.match(/.{1,4}/g)?.join(' ') || '';
    e.target.value = value;
    viewNumber.innerText = value || '•••• •••• •••• ••••';
    updateCardBrand(value);
});

inputName.addEventListener('input', (e) => {
    const value = e.target.value.toUpperCase();
    e.target.value = value;
    viewName.innerText = value || 'NOME DO TITULAR';
});

inputExpiry.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) value = value.substring(0, 2) + '/' + value.substring(2, 4);
    e.target.value = value;
    viewExpiry.innerText = value || 'MM/AA';
});

inputCVV.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    e.target.value = value;
    viewCVV.innerText = value || '•••';
});

// Animação 3D Flip
inputCVV.addEventListener('focus', () => card.classList.add('flipped'));
[inputNumber, inputName, inputExpiry].forEach(input => {
    input.addEventListener('focus', () => card.classList.remove('flipped'));
});

// FUNÇÃO DO BOTÃO "LIMPAR TUDO" (Reseta a interface)
btnClear.addEventListener('click', () => {
    resetFormAndCard();
});

function resetFormAndCard() {
    cardForm.reset();
    viewNumber.innerText = '•••• •••• •••• ••••';
    viewName.innerText = 'NOME DO TITULAR';
    viewExpiry.innerText = 'MM/AA';
    viewCVV.innerText = '•••';
    card.classList.remove('flipped');
    updateCardBrand('');
}

// SALVAR INFORMAÇÕES (Sem persistir o CVV)
cardForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newCard = {
        id: Date.now(), // Cria um identificador único baseado no milissegundo atual
        number: inputNumber.value,
        name: inputName.value,
        expiry: inputExpiry.value,
        brand: updateCardBrand(inputNumber.value)
    };

    // Puxa a lista existente do localStorage ou cria uma nova se estiver vazia
    const cards = JSON.parse(localStorage.getItem('savedCards')) || [];
    cards.push(newCard);
    localStorage.setItem('savedCards', JSON.stringify(cards));

    // Feedback visual
    successAlert.classList.add('show');
    setTimeout(() => successAlert.classList.remove('show'), 3500);

    resetFormAndCard();
    displayStoredCards();
});

// EXIBIR E RENDERIZAR CARTÕES DO HISTÓRICO
function displayStoredCards() {
    storageList.innerHTML = '';
    const cards = JSON.parse(localStorage.getItem('savedCards')) || [];

    if (cards.length === 0) {
        storageList.innerHTML = '<li style="color: #8b949e; font-size: 0.85rem; text-align: center;">Nenhum cartão salvo ainda.</li>';
        return;
    }

    cards.forEach(c => {
        // Mascara o número do cartão para exibir apenas os 4 últimos dígitos por segurança
        const hiddenNumber = `•••• •••• •••• ${c.number.slice(-4)}`;
        
        const li = document.createElement('li');
        li.className = 'storage-item';
        li.innerHTML = `
            <div class="storage-info">
                <strong>${hiddenNumber}</strong>
                <span>${c.name} | Val: ${c.expiry} (${c.brand})</span>
            </div>
            <button class="btn-delete-item" onclick="deleteCard(${c.id})">Excluir</button>
        `;
        storageList.appendChild(li);
    });
}

// EXCLUIR UM CARTÃO ESPECÍFICO DO ARMAZENAMENTO
window.deleteCard = function(id) {
    let cards = JSON.parse(localStorage.getItem('savedCards')) || [];
    // Filtra removendo o cartão que possui o id clicado
    cards = cards.filter(c => c.id !== id);
    localStorage.setItem('savedCards', JSON.stringify(cards));
    displayStoredCards();
};
