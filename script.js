let blockchain = [];


// SHA-256 хеширование

async function generateHash(data) {

    const encoder = new TextEncoder();

    const encodedData = encoder.encode(data);

    const hashBuffer =
        await crypto.subtle.digest(
            "SHA-256",
            encodedData
        );

    const hashArray =
        Array.from(
            new Uint8Array(hashBuffer)
        );

    const hashHex =
        hashArray
            .map(byte =>
                byte
                    .toString(16)
                    .padStart(2, "0")
            )
            .join("");

    return hashHex;
}


// Создание блока

async function createBlock(
    sender,
    receiver,
    amount,
    status
) {

    const previousBlock =
        blockchain[
            blockchain.length - 1
        ];


    const previousHash =
        previousBlock
            ? previousBlock.hash
            : "GENESIS";


    const block = {

        id:
            Date.now() +
            Math.floor(Math.random() * 1000),

        blockNumber:
            blockchain.length + 1,

        sender:
            sender,

        receiver:
            receiver,

        amount:
            amount,

        status:
            status,

        previousHash:
            previousHash,

        timestamp:
            new Date().toISOString(),

        hash: ""
    };


    const dataForHash =
        block.id +
        block.blockNumber +
        block.sender +
        block.receiver +
        block.amount +
        block.status +
        block.previousHash +
        block.timestamp;


    block.hash =
        await generateHash(dataForHash);


    return block;
}


// Создание демонстрационных блоков

async function initializeBlockchain() {

    const transactions = [

        {
            sender: "Alice",
            receiver: "Bob",
            amount: 100,
            status: "Confirmed"
        },

        {
            sender: "Bob",
            receiver: "Charlie",
            amount: 250,
            status: "Confirmed"
        },

        {
            sender: "Charlie",
            receiver: "David",
            amount: 75,
            status: "Pending"
        },

        {
            sender: "David",
            receiver: "Emma",
            amount: 500,
            status: "Confirmed"
        },

        {
            sender: "Emma",
            receiver: "Alex",
            amount: 120,
            status: "Rejected"
        }

    ];


    for (const transaction of transactions) {

        const block =
            await createBlock(
                transaction.sender,
                transaction.receiver,
                transaction.amount,
                transaction.status
            );

        blockchain.push(block);
    }


    displayBlockchain();
}


// Отображение таблицы

function displayBlockchain() {

    const table =
        document.getElementById(
            "transactionTable"
        );


    table.innerHTML = "";


    blockchain.forEach(block => {

        const row =
            document.createElement("tr");


        let statusClass =
            block.status.toLowerCase();


        row.innerHTML = `

            <td>
                ${block.blockNumber}
            </td>

            <td>
                ${block.sender}
            </td>

            <td>
                ${block.receiver}
            </td>

            <td>
                ${block.amount}
            </td>

            <td class="${statusClass}">
                ${block.status}
            </td>

            <td
                class="hash"
                title="${block.hash}"
            >
                ${block.hash}
            </td>

        `;


        table.appendChild(row);

    });

}


// Добавление новой транзакции

document
    .getElementById("transactionForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const sender =
                document
                    .getElementById("sender")
                    .value;


            const receiver =
                document
                    .getElementById("receiver")
                    .value;


            const amount =
                document
                    .getElementById("amount")
                    .value;


            const status =
                document
                    .getElementById("status")
                    .value;


            const newBlock =
                await createBlock(
                    sender,
                    receiver,
                    amount,
                    status
                );


            blockchain.push(newBlock);


            displayBlockchain();


            document
                .getElementById("transactionForm")
                .reset();


            document
                .getElementById("chainStatus")
                .textContent =
                "Новая транзакция успешно добавлена";

        }
    );


// Проверка целостности блокчейна

async function verifyBlockchain() {

    const statusElement =
        document.getElementById(
            "chainStatus"
        );


    for (
        let i = 0;
        i < blockchain.length;
        i++
    ) {

        const block =
            blockchain[i];


        const dataForHash =
            block.id +
            block.blockNumber +
            block.sender +
            block.receiver +
            block.amount +
            block.status +
            block.previousHash +
            block.timestamp;


        const calculatedHash =
            await generateHash(dataForHash);


        // Проверяем сам блок

        if (
            calculatedHash !==
            block.hash
        ) {

            statusElement.textContent =
                "❌ Обнаружено изменение данных в блоке №" +
                block.blockNumber;

            statusElement.style.color =
                "red";

            return false;
        }


        // Проверяем связь с предыдущим блоком

        if (i > 0) {

            const previousBlock =
                blockchain[i - 1];


            if (
                block.previousHash !==
                previousBlock.hash
            ) {

                statusElement.textContent =
                    "❌ Цепочка блоков нарушена между блоками " +
                    previousBlock.blockNumber +
                    " и " +
                    block.blockNumber;

                statusElement.style.color =
                    "red";

                return false;
            }

        }

    }


    statusElement.textContent =
        "✅ Блокчейн-цепочка целостна";

    statusElement.style.color =
        "green";


    return true;
}


// Кнопка проверки

document
    .getElementById("checkChainButton")
    .addEventListener(
        "click",
        verifyBlockchain
    );


// Запуск приложения

initializeBlockchain();