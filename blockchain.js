// npm install --save crypto-js
const http = require('http');
const url = require('url');
const SHA256 = require('crypto-js/sha256');

var progreso = 0;

class Contract {
    constructor(clientName, totalAmount, completionDate) {
        this.clientName = clientName;
        this.totalAmount = totalAmount;
        this.completionDate = completionDate;
        this.progress = 0;
        this.paymentAmount = totalAmount / 4;
        this.paymentCount = 0;
    }

    getPaymentDue() {
        if (this.progress >= 25 * (this.paymentCount + 1)) {
            this.paymentCount++;
            return this.paymentAmount;
        } else {
            return 0;
        }
    }

    checkProgress(newProgress) {
        if (newProgress >= 0 && newProgress <= 100) {
            this.progress = newProgress;
        }
    }

    isComplete() {
        return this.progress === 100;
    }

    isPastDue() {
        const currentDate = new Date().getTime();
        return currentDate > this.completionDate;
    }
}

class Block {
    constructor(index, data, previousHash = '') {
        this.index = index;
        this.timestamp = new Date().getTime();
        this.data = data;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return SHA256(
            this.index +
            this.timestamp +
            JSON.stringify(this.data) +
            this.previousHash +
            this.nonce
        ).toString();
    }

    mineBlock(difficulty) {
        while (!this.hash.startsWith(difficulty)) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log('Bloque minado: ' + this.hash + ' con nonce ' + this.nonce);
    }
}

class Blockchain {
    constructor(genesis, difficulty = '0000') {
        this.chain = [this.createFirstBlock(genesis)];
        this.difficulty = difficulty;
        this.contract = null;
    }

    createFirstBlock(genesis) {
        return new Block(0, genesis);
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(data) {
        const prevBlock = this.getLastBlock();
        const block = new Block(prevBlock.index + 1, data, prevBlock.hash);
        block.mineBlock(this.difficulty);
        this.chain.push(block);

        if (this.contract !== null) {
            this.contract.checkProgress(data.progress);

            if (this.contract.isComplete()) {
                console.log(
                    `El contrato para ${this.contract.clientName} ha sido completado`

                );
                progreso = 0;
            } else if (this.contract.isPastDue()) {
                console.log(
                    `El contrato para ${this.contract.clientName} ha expirado`
                );
                progreso = 0;
            } else {
                const paymentDue = this.contract.getPaymentDue();

                if (paymentDue > 0) {
                    console.log(
                        `Desembolso de ${paymentDue} pesos para ${this.contract.clientName
                        }`
                    );
                }
            }
        }
    }

    setContract(contract) {
        this.contract = contract;
    }
}

const naniCoin = new Blockchain('info', '0000');
var nombre_constructora = '', precio_total = 0, fecha_limite = '';

// const contract = new Contract('Constructora X', 1000000, new Date('2024-06-01'));



var name_constructora = "";
var number_contract2 = 0;


const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const parsedUrl = url.parse(req.url, true);

    if (req.method === 'OPTIONS') {
        // Agrega los encabezados CORS necesarios para permitir cualquier origen
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.writeHead(204);
        res.end();
    } else if (parsedUrl.pathname === '/chain' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(naniCoin.chain));
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    else if (req.method === 'POST' && req.url === '/contracts') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const contractData = JSON.parse(body);
            name_constructora = contractData.nombre_constructora;
            number_contract2 = contractData.number_contract;
            const contract = new Contract(
                contractData.nombre_constructora,
                contractData.valor_total,
                new Date(contractData.fecha_limite)
            );
            naniCoin.setContract(contract);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Contract created successfully');
        });
    }


    else if (parsedUrl.pathname === '/block' && req.method === 'POST') {

        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', () => {
            const data = JSON.parse(body);


            progreso = progreso + data.progress
            if(progreso >= 100){
                progreso = 100;
            }
            const blockData = {
                progress: progreso,
                clientName: data.clientName,
                nameConstruction: name_constructora,
                numberContract: number_contract2,
            };


            naniCoin.addBlock(blockData);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
                JSON.stringify({
                    message: 'Bloque agregado a la cadena de bloques',
                    block: naniCoin.getLastBlock()
                })
            );
            
        });
    }
    else {
        // Manejador para cualquier otro tipo de petición
        res.writeHead(404);
        res.end();
    }
});



// Iniciar el servidor en el puerto 3000
server.listen(3000, () => {
    console.log('Servidor iniciado en http://localhost:3000');
});