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

const program = new Program<Devolt>(IDL, "7HhCBpYxGZU4jsYy295T68VWqqRgyLvK17wcrBS6bTVm", { connection });

console.log("Program ID", program.programId.toString());

startListeningToDeVoltAccount();

async function startListeningToDeVoltAccount() {
    const id = 'station1';

    // const latitude = /* São Paulo */ -23.5505;
    // const longitude = /* São Paulo */ -46.6333;
    // const capacity = new anchor.BN(10);
    // const available = new anchor.BN(20);

    const [stationPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(anchor.utils.bytes.utf8.encode(id)), devoltKeypair.publicKey.toBuffer()],
        program.programId
    );

    // const tx = await program.methods
    //     .batteryReport(
    //         id,
    //         latitude,
    //         longitude,
    //         capacity,
    //         available,
    //     )
    //     .accounts({
    //         station: stationPda,
    //         owner: devoltKeypair.publicKey,
    //     })
    //     .rpc();

    const station = await program.account.station.fetch(stationPda);
    console.log("Station: ", {
        id: station.id.toString(),
        latitude: station.latitude,
        longitude: station.longitude,
        capacity: station.capacity,
        available: station.available,
    })

    connection.onAccountChange(stationPda, (account) => {
        console.log("Something changed: ", account); 
        // Something changed:  {
        //     lamports: 1670400,
        //     data: <Buffer 2e 09 78 b6 be e8 08 7e 86 32 a8 db 9d 84 40 e2 ef 48 af 2a 86 cd c0 a0 54 27 df aa 55 f8 b4 9c ed 63 e6 66 1d 4f 6d cd 08 00 00 00 73 74 61 74 69 6f ... 62 more bytes>,
        //     owner: PublicKey [PublicKey(7HhCBpYxGZU4jsYy295T68VWqqRgyLvK17wcrBS6bTVm)] {
        //       _bn: <BN: 5d6cdc58ac5122acbaa421cc3291963958ec852c00643d9e571a7b5c3102eb6c>
        //     },
        //     executable: false,
        //     rentEpoch: 18446744073709552000,
        //     space: 112
        //   }

        const decoded = program.coder.accounts.decode(
            "station",
            account.data
        )

        console.log("Decoded: ", decoded);
    });

    // const DeVoltPDA = await anchor.web3.PublicKey.findProgramAddressSync(
    //     [
    //       Buffer.from("led-switch"),
    //     ],
    //     program.programId,
    //   )[0];

    // const DeVoltAccount = await program.account.station.fetch(
    //     DeVoltPDA
    // )

    // console.log(JSON.stringify(DeVoltAccount));
    // console.log("Led is: ", DeVoltAccount.isOn);
    // if (DeVoltAccount.isOn) {
    //   LED.writeSync(1);
    // } else {
    //   LED.writeSync(0);
    // }
    
    // connection.onAccountChange(DeVoltPDA, (account) => {
    //     const decoded = program.coder.accounts.decode(
    //         "DeVolt",
    //         account.data
    //       )

    //       if (decoded.isOn) {
    //         LED.writeSync(1);
    //       } else {
    //         LED.writeSync(0);
    //       }
    //     console.log("Account changed. Led is: ", decoded.isOn);
    // }, "processed")
};