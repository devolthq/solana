import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Devolt, IDL } from "../target/types/devolt";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import * as fs from "fs";

const devoltKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync("/Users/marcelofeitoza/.config/solana/id.json", "utf-8"))));

let connection = new Connection(clusterApiUrl("devnet"));
let wallet = new NodeWallet(devoltKeypair)
const provider = new anchor.AnchorProvider(connection, wallet, {
  commitment: "processed",
});
anchor.setProvider(provider);

// const program = new Program<Devolt>(IDL, "F7F5ZTEMU6d5Ac8CQEJKBGWXLbte1jK2Kodyu3tNtvaj", { connection })
// const program = anchor.workspace.DeVolt as Program<Devolt>;

const program = new Program<Devolt>(IDL, "Hzvebg214S12bog5bEMqLzwydVihYwDuyw4H6PJZoF23", { connection });

console.log("Program ID", program.programId.toString());

// startListeningStation("station1");
startListeningAllStations();

async function startListeningStation(id: string) {
    const [stationPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(anchor.utils.bytes.utf8.encode(id)), devoltKeypair.publicKey.toBuffer()],
        program.programId
    );

    const stations = await program.account.station.all();
    console.log("Stations: ", stations);

    connection.onAccountChange(stationPda, (account) => {
        const decoded = program.coder.accounts.decode(
            "station",
            account.data
        )

        console.log("Capacity: ", decoded.capacity);
        console.log("Availability: ", decoded.available);

        if (decoded.available <= 0.2 * decoded.capacity) {
            console.log("Low battery. Send notification.");
        } else {
            console.log("Battery OK.");
        }
    });
}

async function startListeningAllStations() {
    const stations = await program.account.station.all();

    const stationAccountType = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(anchor.utils.bytes.utf8.encode('station'))],
        program.programId
    );

    connection.onProgramAccountChange(program.programId, async (account) => {
        const decoded = program.coder.accounts.decode(
            "station",
            account.accountInfo.data
        )

        console.log(`Station ${decoded.id}: Capacity ${decoded.capacity}, Available ${decoded.available}`);

        if (decoded.available <= 0.2 * decoded.capacity) {
            console.log("Low battery. Auction needed- set to start.\n");
        } else {
            console.log("Battery OK.\n");
        }
    });
};