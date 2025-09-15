import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// NYC-focused demo data for the music collaboration platform
const nycMusicianProfiles = [
  {
    name: "Maya Rodriguez",
    email: "maya.rodriguez@example.com",
    location: "Williamsburg, Brooklyn",
    instruments: JSON.stringify(["vocals", "guitar", "piano"]),
    genres: JSON.stringify(["indie rock", "folk", "alternative"]),
    experienceLevel: "intermediate",
    collaborationType: "band formation",
    bio: "Bilingual singer-songwriter with a passion for storytelling through music. I write in both English and Spanish, drawing from my Puerto Rican heritage. Looking to form an indie rock band with like-minded artists who value authenticity and creativity.",
    availability: "weekends and evenings"
  },
  {
    name: "Marcus Chen",
    email: "marcus.chen@example.com",
    location: "Lower East Side, Manhattan",
    instruments: JSON.stringify(["piano", "keyboard", "synthesizer"]),
    genres: JSON.stringify(["jazz", "fusion", "electronic"]),
    experienceLevel: "advanced",
    collaborationType: "session work",
    bio: "Classically trained pianist who fell in love with jazz improvisation. I blend traditional jazz with modern electronic elements. Available for studio sessions, live performances, and collaborative projects.",
    availability: "flexible schedule"
  },
  {
    name: "Zoe Washington",
    email: "zoe.washington@example.com",
    location: "Bedford-Stuyvesant, Brooklyn",
    instruments: JSON.stringify(["drums", "percussion"]),
    genres: JSON.stringify(["hip-hop", "neo-soul", "jazz"]),
    experienceLevel: "professional",
    collaborationType: "band formation",
    bio: "Grammy-nominated drummer with 15+ years of experience. I've toured with major R&B and hip-hop artists. Now looking to collaborate with emerging artists and form a new project that pushes musical boundaries.",
    availability: "weekday evenings"
  },
  {
    name: "Alex Thompson",
    email: "alex.thompson@example.com",
    location: "Astoria, Queens",
    instruments: JSON.stringify(["bass", "upright bass"]),
    genres: JSON.stringify(["indie rock", "post-punk", "alternative"]),
    experienceLevel: "intermediate",
    collaborationType: "band formation",
    bio: "Bassist with a love for driving rhythms and melodic basslines. Influences range from Joy Division to Tame Impala. Looking to join or form a band that values creativity and live performance energy.",
    availability: "weekends and evenings"
  },
  {
    name: "Sofia Nakamura",
    email: "sofia.nakamura@example.com",
    location: "Greenwich Village, Manhattan",
    instruments: JSON.stringify(["violin", "viola"]),
    genres: JSON.stringify(["classical", "indie folk", "chamber pop"]),
    experienceLevel: "professional",
    collaborationType: "session work",
    bio: "Julliard-trained violinist exploring the intersection of classical and contemporary music. I love adding string arrangements to indie and folk projects. Available for recording sessions and live performances.",
    availability: "flexible schedule"
  },
  {
    name: "Jordan Williams",
    email: "jordan.williams@example.com",
    location: "Park Slope, Brooklyn",
    instruments: JSON.stringify(["guitar", "vocals"]),
    genres: JSON.stringify(["blues", "rock", "soul"]),
    experienceLevel: "advanced",
    collaborationType: "jamming",
    bio: "Blues guitarist with soul in my fingertips. Influenced by B.B. King, Stevie Ray Vaughan, and Gary Clark Jr. Always looking for musicians to jam with and explore the deeper side of blues and rock.",
    availability: "weekend afternoons"
  },
  {
    name: "Luna Park",
    email: "luna.park@example.com",
    location: "Bushwick, Brooklyn",
    instruments: JSON.stringify(["synthesizer", "vocals", "guitar"]),
    genres: JSON.stringify(["electronic", "synth-pop", "ambient"]),
    experienceLevel: "intermediate",
    collaborationType: "duo collaboration",
    bio: "Electronic music producer and vocalist creating dreamy soundscapes. I blend analog synths with digital production to create immersive musical experiences. Looking for collaborators who share a vision for experimental pop.",
    availability: "evenings and weekends"
  },
  {
    name: "David Kim",
    email: "david.kim@example.com",
    location: "Koreatown, Manhattan",
    instruments: JSON.stringify(["saxophone", "clarinet"]),
    genres: JSON.stringify(["jazz", "bebop", "smooth jazz"]),
    experienceLevel: "professional",
    collaborationType: "session work",
    bio: "Professional saxophonist with 20+ years of experience in the NYC jazz scene. I've performed at Blue Note, Village Vanguard, and Lincoln Center. Available for recordings, live gigs, and teaching.",
    availability: "professional availability"
  },
  {
    name: "Emma Foster",
    email: "emma.foster@example.com",
    location: "Red Hook, Brooklyn",
    instruments: JSON.stringify(["cello", "piano"]),
    genres: JSON.stringify(["classical", "post-rock", "experimental"]),
    experienceLevel: "advanced",
    collaborationType: "chamber music",
    bio: "Cellist fascinated by the intersection of classical technique and modern composition. I perform both traditional classical repertoire and contemporary experimental music. Seeking collaborations with forward-thinking musicians.",
    availability: "weekday evenings"
  },
  {
    name: "Carlos Martinez",
    email: "carlos.martinez@example.com",
    location: "Washington Heights, Manhattan",
    instruments: JSON.stringify(["guitar", "vocals", "percussion"]),
    genres: JSON.stringify(["latin", "salsa", "jazz"]),
    experienceLevel: "professional",
    collaborationType: "band formation",
    bio: "Latin jazz guitarist with deep roots in salsa and Afro-Cuban music. Born in Cuba, raised in NYC. I bring authentic Latin rhythms and jazz improvisation to any project. Looking to form a new Latin jazz ensemble.",
    availability: "evenings and weekends"
  },
  {
    name: "Riley Johnson",
    email: "riley.johnson@example.com",
    location: "Crown Heights, Brooklyn",
    instruments: JSON.stringify(["vocals", "ukulele", "guitar"]),
    genres: JSON.stringify(["folk", "indie pop", "singer-songwriter"]),
    experienceLevel: "beginner",
    collaborationType: "jamming",
    bio: "Singer-songwriter just starting my musical journey in NYC. I write intimate, personal songs about life, love, and growing up. Looking for other beginners or patient experienced musicians to learn and grow with.",
    availability: "weekend mornings"
  },
  {
    name: "Sam Chen",
    email: "sam.chen@example.com",
    location: "Chinatown, Manhattan",
    instruments: JSON.stringify(["drums", "vocals"]),
    genres: JSON.stringify(["punk", "hardcore", "alternative"]),
    experienceLevel: "intermediate",
    collaborationType: "band formation",
    bio: "High-energy drummer with a punk rock heart. I play fast, aggressive, and with passion. Looking to form or join a punk/hardcore band that's ready to play shows and make some noise in the NYC scene.",
    availability: "nights and weekends"
  }
];

async function seedDatabase() {
  console.log('🎵 Starting NYC demo data seeding...');

  // Clear existing data
  await prisma.user.deleteMany({});
  console.log('🗑️ Cleared existing users');

  // Add demo profiles
  for (const profile of nycMusicianProfiles) {
    await prisma.user.create({
      data: profile
    });
  }

  console.log(`✅ Created ${nycMusicianProfiles.length} NYC musician profiles`);

  console.log('\n📋 Sample profiles created:');
  nycMusicianProfiles.slice(0, 3).forEach((profile, index) => {
    const instruments = JSON.parse(profile.instruments);
    const genres = JSON.parse(profile.genres);

    console.log(`${index + 1}. ${profile.name} (${profile.email})`);
    console.log(`   Instruments: ${instruments.join(', ')}`);
    console.log(`   Genres: ${genres.join(', ')}`);
    console.log(`   Location: ${profile.location}`);
    console.log(`   Experience: ${profile.experienceLevel} | Type: ${profile.collaborationType}\n`);
  });

  console.log('🎉 NYC demo data seeding completed!');
}

seedDatabase()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });