import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDestinationsEmojis() {
    console.log('--- Avvio correzione automatica Emoji DESTINAZIONI ---');

    try {
        const destinazioni = await prisma.destination.findMany({
            where: { description: { contains: '?' } },
            select: { id: true, name: true, description: true }
        });

        console.log(`Trovate ${destinazioni.length} destinazioni da controllare...`);
        let updatedCount = 0;

        for (const dest of destinazioni) {
            if (!dest.description) continue;

            let newDesc = dest.description;

            // Sostituzioni Magiche (Uso una Regex flessibile per catturare anche ?️ strani)
            newDesc = newDesc.replace(/\?\s*Cosa vedere assolutamente/g, '📸 Cosa vedere assolutamente');
            newDesc = newDesc.replace(/\?.*Sapori tipici da non perdere/g, '🍝 Sapori tipici da non perdere');
            newDesc = newDesc.replace(/\?\s*Budget/g, '💰 Budget');
            newDesc = newDesc.replace(/\?\s*Consigli pratici/g, '💡 Consigli pratici');

            if (newDesc !== dest.description) {
                await prisma.destination.update({
                    where: { id: dest.id },
                    data: { description: newDesc }
                });
                updatedCount++;
                process.stdout.write(`✅ Corretta: ${dest.name}\n`);
            }
        }

        console.log(`\n--- RIEPILOGO ---`);
        console.log(`Destinazioni riparate: ${updatedCount}`);

    } catch (error) {
        console.error('❌ Errore durante la correzione:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixDestinationsEmojis();
