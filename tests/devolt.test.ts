import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Devolt } from "../target/types/devolt";
import { Keypair } from "@solana/web3.js";
import { clusterApiUrl, Connection } from "@solana/web3.js"
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import * as fs from "fs";
import { off } from "process";

describe("devolt", () => {
    let initialBalance: number;

    const devoltKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync("/Users/marcelofeitoza/.config/solana/id.json", "utf-8"))));

    // const provider = anchor.AnchorProvider.env();
    const provider = new anchor.AnchorProvider(new Connection(clusterApiUrl("devnet")), new NodeWallet(devoltKeypair), {
        commitment: "processed",
    });
    anchor.setProvider(provider);

    const program = anchor.workspace.Devolt as Program<Devolt>;

    beforeEach(async () => {
        const airdropAmount = 1;
        const balance = await provider.connection.getBalance(devoltKeypair.publicKey);
        if (balance < airdropAmount) {
            console.log(`Airdropping ${airdropAmount} SOL to ${devoltKeypair.publicKey}`);
            await provider.connection.requestAirdrop(devoltKeypair.publicKey, airdropAmount);
        }

        initialBalance = balance;
    });

    afterEach(async () => {
        const finalBalance = await provider.connection.getBalance(devoltKeypair.publicKey);
        finalBalance < 0 ?? console.log(`Balance change: ${(initialBalance - finalBalance) / 10 ** 9}`);
    });

    it('Should report battery thus creating a new station', async () => {
        const id = 'station1';
        const latitude = 12345.6789;
        const longitude = 98765.4321;
        const capacity = 12345.6789;
        const available = 12345.6789;

        const [stationPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from(anchor.utils.bytes.utf8.encode(id)), devoltKeypair.publicKey.toBuffer()],
            program.programId
        );

        await program.methods
            .batteryReport(
                id,
                latitude,
                longitude,
                capacity,
                available,
            )
            .accounts({
                station: stationPda,
                owner: devoltKeypair.publicKey,
            })
            .rpcAndKeys();

        const station = await program.account.station.fetch(stationPda);

        expect(station.id).toEqual(id);
        expect(station.latitude).toEqual(latitude);
        expect(station.longitude).toEqual(longitude);
        expect(station.capacity).toEqual(capacity);
        expect(station.available).toEqual(available);
    });

    it("Should update station's available battery", async () => {
        const id = 'station1';
        const latitude = null;
        const longitude = null;
        const capacity = null;
        const available = 100.00;

        const [stationPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from(anchor.utils.bytes.utf8.encode(id)), devoltKeypair.publicKey.toBuffer()],
            program.programId
        );

        const tx = await program.methods
            .batteryReport(
                id,
                latitude,
                longitude,
                capacity,
                available,
            )
            .accounts({
                station: stationPda,
                owner: devoltKeypair.publicKey,
            })
            .rpcAndKeys()
            .catch((error) => {
                console.log(error);
            });

        const station = await program.account.station.fetch(stationPda);

        expect(station.id).toEqual(id);
        expect(station.available).toEqual(available);
    });

    it('Should error when trying to update an existing station without providing latitude, longitude, and capacity', async () => {
        const id = 'station2';
        const latitude = 12345.6789;
        const longitude = 98765.4321;
        const capacity = 12345.6789;
        const available = 12345.6789;

        const [stationPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from(anchor.utils.bytes.utf8.encode(id)), devoltKeypair.publicKey.toBuffer()],
            program.programId
        );

        try {
            await program.methods
                .batteryReport(
                    id,
                    latitude,
                    longitude,
                    capacity,
                    available,
                )
                .accounts({
                    station: stationPda,
                    owner: devoltKeypair.publicKey,
                })
                .rpc();
        } catch (error) {
            expect(error).toBeDefined();
        }
    });

    it('Get stations', async () => {
        const stations = await program.account.station.all();

        expect(stations.length).toBeGreaterThan(0);
    });

    it('Get station', async () => {
        const id = 'station1';
        const [stationPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from(anchor.utils.bytes.utf8.encode(id)), devoltKeypair.publicKey.toBuffer()],
            program.programId
        );

        const station = await program.account.station.fetch(stationPda);

        expect(station.id).toEqual(id);
    });
});
