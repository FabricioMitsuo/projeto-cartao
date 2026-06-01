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
const viewAccount = document.getElementById('viewAccount');
const viewLimit = document.getElementById('viewLimit');

// Investimentos (demo)
const inputInvest = document.getElementById('inputInvest');
const btnInvest = document.getElementById('btnInvest');
const btnIncreaseLimit = document.getElementById('btnIncreaseLimit');
const limitAlert = document.getElementById('limitAlert');


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
    viewAccount.innerText = '0000-0';
    viewLimit.innerText = 'R$ 50.000';

    inputInvest.value = '';
    btnIncreaseLimit.style.display = 'none';
    limitAlert.style.display = 'none';

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
        brand: updateCardBrand(inputNumber.value),
        account: generateAccountFicticio(),
        limit: 50000 // limite fictício inicial
    };

    // Atualiza a UI do cartão atual imediatamente
    viewAccount.innerText = newCard.account;
    viewLimit.innerText = formatBRL(newCard.limit);


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
function formatBRL(value) {
    const num = Number(value) || 0;
    return 'R$ ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function generateAccountFicticio() {
    // Ex: 1234-5 (apenas demo)
    const base = Math.floor(1000 + Math.random() * 9000).toString();
    const digit = Math.floor(Math.random() * 10);
    return `${base}-${digit}`;
}

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
                <span>Conta: ${c.account || '0000-0'} | Limite: ${formatBRL(c.limit || 0)}</span>
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

function getActiveCard() {
    // Para simplificar o demo, usa o último cartão salvo como "cartão ativo".
    const cards = JSON.parse(localStorage.getItem('savedCards')) || [];
    return cards.length ? cards[cards.length - 1] : null;
}

function setActiveCard(updatedCard) {
    const cards = JSON.parse(localStorage.getItem('savedCards')) || [];
    if (!cards.length) return;

    // Substitui pelo id (caso existam múltiplos)
    const idx = cards.findIndex(c => c.id === updatedCard.id);
    if (idx === -1) return;

    cards[idx] = updatedCard;
    localStorage.setItem('savedCards', JSON.stringify(cards));
    displayStoredCards();
}

function updateLimitUI(limit) {
    viewLimit.innerText = formatBRL(limit);
}

function showLimitExceededUI() {
    limitAlert.style.display = 'block';
    btnIncreaseLimit.style.display = 'block';
}

function hideLimitExceededUI() {
    limitAlert.style.display = 'none';
    btnIncreaseLimit.style.display = 'none';
}

btnInvest.addEventListener('click', () => {
    const card = getActiveCard();
    if (!card) return;

    const investment = Number(String(inputInvest.value).replace(/\D/g, '')) || 0;
    if (investment <= 0) return;

    if (investment > (card.limit || 0)) {
        showLimitExceededUI();
        return;
    }

    // Sucesso (demo): investimento "aprovado" sem persistir investimentos
    hideLimitExceededUI();
    alert('✅ Investimento aprovado (demo).');
    inputInvest.value = '';
});

btnIncreaseLimit.addEventListener('click', () => {
    const card = getActiveCard();
    if (!card) return;

    const additional = 50000;
    const nextLimit = (card.limit || 0) + additional;
    const updated = { ...card, limit: nextLimit };

    setActiveCard(updated);
    updateLimitUI(updated.limit);
    hideLimitExceededUI();
    alert('🎉 Limite aumentado com sucesso! Você já pode fazer investimentos futuros.');
});

