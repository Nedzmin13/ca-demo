import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixEmojis() {
    console.log('--- Avvio correzione automatica Emoji ---');

    try {
        // Troviamo tutti i comuni che hanno un "?" nella descrizione
        const comuni = await prisma.comune.findMany({
            where: {
                description: { contains: '?' }
            },
            select: { id: true, name: true, description: true }
        });

        console.log(`Trovati ${comuni.length} comuni da controllare...`);
        let updatedCount = 0;

        for (const comune of comuni) {
            if (!comune.description) continue;

            let newDesc = comune.description;

            // Sostituzioni Magiche (Cambia i ? con le emoji giuste)
            newDesc = newDesc.replace(/\? Cosa vedere/g, '🔎 Cosa vedere');
            newDesc = newDesc.replace(/\? Gastronomia rapida/g, '🍷 Gastronomia rapida');
            newDesc = newDesc.replace(/\? Curiosità & Consigli/g, '💡 Curiosità & Consigli');
            newDesc = newDesc.replace(/\? Itinerario/g, '📅 Itinerario');

            // Se il testo è cambiato, lo salviamo nel database
            if (newDesc !== comune.description) {
                await prisma.comune.update({
                    where: { id: comune.id },
                    data: { description: newDesc }
                });
                updatedCount++;
                process.stdout.write(`✅ Corretto: ${comune.name}\n`);
            }
        }

        console.log(`\n--- RIEPILOGO ---`);
        console.log(`Comuni riparati con successo: ${updatedCount}`);

    } catch (error) {
        console.error('❌ Errore durante la correzione:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixEmojis();