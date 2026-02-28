require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seeding (Clean CommonJS)...');

    // 1. Create a default company (SaaS demo tenant)
    const company = await prisma.company.upsert({
        where: { slug: 'escala-digital' },
        update: {
            name: 'Companhia Demo',
            logoUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop',
        },
        create: {
            name: 'Companhia Demo',
            slug: 'escala-digital',
            logoUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop',
        },
    });

    console.log(`✅ Company created: ${company.name}`);

    // 2. Create a creator user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const creator = await prisma.user.upsert({
        where: { email: 'admin@escaladigital.com' },
        update: {},
        create: {
            email: 'admin@escaladigital.com',
            name: 'Admin Escala',
            password: hashedPassword,
            role: 'CREATOR',
            companyId: company.id,
        },
    });

    console.log(`✅ Creator created: ${creator.name}`);

    // 2.1 Create a student user
    const hashedStudentPassword = await bcrypt.hash('aluno123', 10);
    const student = await prisma.user.upsert({
        where: { email: 'aluno@escaladigital.com' },
        update: {},
        create: {
            email: 'aluno@escaladigital.com',
            name: 'Aluno Teste',
            password: hashedStudentPassword,
            role: 'STUDENT',
            companyId: company.id,
        },
    });

    console.log(`✅ Student created: ${student.name}`);

    // 3. Create course data
    const coursesData = [
        {
            title: 'Masterclass: High-Performance Marketing',
            description: 'Aprenda as estratégias mais avançadas de growth hacking e marketing digital para escalar seu negócio.',
            category: 'Marketing',
            thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2026&auto=format&fit=crop',
            level: 'advanced',
            durationMins: 180,
            rating: 4.9,
            published: true,
            companyId: company.id,
        },
        {
            title: 'Design de Interfaces Ultra-Modernas',
            description: 'Domine as técnicas de Glassmorphism, Micro-interações e Layout Imersivo para criar UIs que impactam.',
            category: 'Design',
            thumbnail: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1964&auto=format&fit=crop',
            level: 'intermediate',
            durationMins: 120,
            rating: 4.8,
            published: true,
            companyId: company.id,
        },
        {
            title: 'Copywriting para Conversão Máxima',
            description: 'A arte de escrever textos que vendem. Teoria e prática para landing pages de alta conversão.',
            category: 'Vendas',
            thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=2046&auto=format&fit=crop',
            level: 'beginner',
            durationMins: 90,
            rating: 4.7,
            published: true,
            companyId: company.id,
        },
        {
            title: 'Product Management 2.0',
            description: 'Gestão de produtos na era da IA e decisões baseadas em dados.',
            category: 'Gestão',
            thumbnail: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?q=80&w=2076&auto=format&fit=crop',
            level: 'advanced',
            durationMins: 240,
            rating: 4.9,
            published: true,
            companyId: company.id,
        }
    ];

    const videos = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://www.youtube.com/watch?v=XqZisWVXss4',
        'https://www.youtube.com/watch?v=c9Wg6A_De6U'
    ];

    for (const data of coursesData) {
        const course = await prisma.course.create({ data });
        console.log(`✅ Course created: ${course.title}`);

        const module = await prisma.module.create({
            data: {
                title: 'Módulo Inicial: Fundamentos',
                order: 1,
                courseId: course.id,
            }
        });

        for (let i = 1; i <= 3; i++) {
            await prisma.lesson.create({
                data: {
                    title: `Aula ${i}: Introdução e Conceitos`,
                    description: 'Uma aula introdutória sobre o tema.',
                    videoUrl: videos[i - 1],
                    duration: 600,
                    order: i,
                    courseId: course.id,
                    moduleId: module.id,
                }
            });
        }

        // Add some reviews specifically for the first course
        if (data.title === 'Masterclass: High-Performance Marketing') {
            const students = [
                { name: 'Carlos Silva', email: 'carlos@exemplo.com' },
                { name: 'Mariana Costa', email: 'mariana@exemplo.com' },
                { name: 'João Pedro', email: 'joao@exemplo.com' }
            ];

            const comments = [
                "Conteúdo extremamente prático e direto ao ponto. Consegui aplicar já no primeiro dia!",
                "O melhor treinamento que já fiz sobre o assunto. A didática do instrutor é impecável.",
                "Muito bom, as aulas são bem explicadas. Só senti falta de materiais extras em PDF."
            ];

            const ratings = [5, 5, 4];

            for (let i = 0; i < students.length; i++) {
                const studentUser = await prisma.user.upsert({
                    where: { email: students[i].email },
                    update: {},
                    create: {
                        ...students[i],
                        password: hashedPassword,
                        role: 'STUDENT',
                        companyId: company.id
                    }
                });

                await prisma.review.create({
                    data: {
                        rating: ratings[i],
                        comment: comments[i],
                        userId: studentUser.id,
                        courseId: course.id
                    }
                });
            }
            console.log(`✅ Added ${students.length} reviews to ${course.title}`);
        }
    }

    console.log('✨ Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
