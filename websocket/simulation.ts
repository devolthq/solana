import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Devolt, IDL } from "../target/types/devolt";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import * as fs from "fs";
import { createHash, randomUUID } from "crypto";

// Load the Keypair for authentication
const devoltKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync("/Users/marcelofeitoza/.config/solana/id.json", "utf-8"))));

let connection = new Connection(clusterApiUrl("devnet"));
let wallet = new NodeWallet(devoltKeypair)
const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "processed",
});
anchor.setProvider(provider);

const program = new Program<Devolt>(IDL, "Hzvebg214S12bog5bEMqLzwydVihYwDuyw4H6PJZoF23", { connection });

const INTERVAL = 3;

async function simulateStation(id: string, capacity: number) {
    const [stationPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(id), devoltKeypair.publicKey.toBuffer()], 
        program.programId
    );

    let available = capacity;
    let charging = false;

    setInterval(async () => {
        if (charging) {
            available += capacity * 0.05;
            if (available >= capacity) {
                available = capacity;
                charging = false;
            }
        } else {
            available -= capacity * 0.05;
            if (available <= 0) {
                available = 0;
                charging = true;
            }
        }

        try {
            const tx = await program.methods.batteryReport(
                id,
                12345.6789,
                98765.4321,
                capacity,
                available
            ).accounts({
                station: stationPda,
                owner: devoltKeypair.publicKey,
            }).transaction();

            await provider.sendAndConfirm(tx);

            console.log(`Report sent for ${id}: Available ${available.toFixed(2)}\n`);
        } catch (error) {
            console.error(`Error sending report for ${id}: ${error}\n`);
        }
    }, INTERVAL * 1000);
}

// let stationId = randomUUID();
// simulateStation(stationId, 100);

simulateStation("1", 100);