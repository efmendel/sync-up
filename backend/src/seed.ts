import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const instruments = [
  'Guitar', 'Bass', 'Drums', 'Keyboard', 'Piano', 'Violin', 'Saxophone', 'Trumpet',
  'Flute', 'Clarinet', 'Cello', 'Vocals', 'Harmonica', 'Banjo', 'Mandolin', 'Ukulele',
  'Accordion', 'Trombone', 'French Horn', 'Oboe', 'Harp', 'Double Bass', 'Percussion',
  'Synthesizer', 'Turntables', 'Electronic Drums'
];

const genres = [
  'Rock', 'Pop', 'Jazz', 'Blues', 'Classical', 'Hip Hop', 'Electronic', 'Folk',
  'Country', 'Reggae', 'Punk', 'Metal', 'Indie', 'Alternative', 'R&B', 'Soul',
  'Funk', 'Disco', 'House', 'Techno', 'Ambient', 'World Music', 'Gospel', 'Bluegrass',
  'Ska', 'Swing', 'Bossa Nova', 'Experimental', 'Progressive', 'Grunge'
];

const locations = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Philadelphia, PA',
  'Phoenix, AZ', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
  'Austin, TX', 'Jacksonville, FL', 'San Francisco, CA', 'Indianapolis, IN',
  'Columbus, OH', 'Fort Worth, TX', 'Charlotte, NC', 'Seattle, WA', 'Denver, CO',
  'El Paso, TX', 'Detroit, MI', 'Washington, DC', 'Boston, MA', 'Memphis, TN',
  'Nashville, TN', 'Portland, OR', 'Oklahoma City, OK', 'Las Vegas, NV',
  'Baltimore, MD', 'Louisville, KY', 'Milwaukee, WI', 'Albuquerque, NM',
  'Tucson, AZ', 'Fresno, CA', 'Sacramento, CA', 'Kansas City, MO', 'Mesa, AZ',
  'Virginia Beach, VA', 'Atlanta, GA', 'Colorado Springs, CO', 'Omaha, NE',
  'Raleigh, NC', 'Miami, FL', 'Oakland, CA', 'Minneapolis, MN', 'Tulsa, OK',
  'Cleveland, OH', 'Wichita, KS', 'Arlington, TX', 'New Orleans, LA'
];

const availabilities = [
  'Weekends only',
  'Weekday evenings',
  'Full-time',
  'Part-time',
  'Flexible schedule',
  'Monday-Wednesday evenings',
  'Thursday-Sunday',
  'Occasional gigs',
  'Weekend afternoons',
  'Late nights'
];

const experienceLevels = ['beginner', 'intermediate', 'advanced', 'professional'] as const;
const collaborationTypes = ['band formation', 'one-time gig', 'recording/studio work'] as const;

const bios = [
  "Passionate musician looking to connect with like-minded artists for creative collaboration.",
  "Been playing for 15 years, love jamming and exploring new musical territories.",
  "Professional session musician available for recordings and live performances.",
  "Music teacher during the day, rocker by night. Always down for a good jam session.",
  "Classical training meets modern sensibilities. Open to all genres and experiences.",
  "Producer and multi-instrumentalist seeking talented musicians for original projects.",
  "Weekend warrior with a day job but serious about making great music.",
  "Touring musician looking for local connections and collaboration opportunities.",
  "Studio owner interested in working with emerging artists and bands.",
  "Songwriter seeking musicians to bring my compositions to life.",
  "Experienced performer comfortable with both covers and original material.",
  "Music student eager to learn from experienced players and contribute fresh ideas.",
  "Retired professional looking to get back into the music scene for fun.",
  "Multi-genre enthusiast who believes music has no boundaries.",
  "Looking for serious musicians to form a gigging band with regular shows.",
  "Home studio enthusiast interested in remote collaboration and recording projects.",
  "Jazz purist but open to fusion and experimental approaches to traditional forms.",
  "Singer-songwriter seeking backing musicians for original acoustic material.",
  "Electronic music producer looking to incorporate live instruments into productions.",
  "Music therapist using music for healing, seeking collaboration with other healing arts practitioners."
];

const firstNames = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Parker', 'Sage',
  'River', 'Phoenix', 'Skyler', 'Blake', 'Cameron', 'Drew', 'Jesse', 'Reese', 'Emery', 'Finley',
  'Hayden', 'Kendall', 'Lennon', 'Peyton', 'Rowan', 'Sawyer', 'Tanner', 'Aubrey', 'Bailey', 'Charlie',
  'Dakota', 'Elliott', 'Frankie', 'Gray', 'Harper', 'Indigo', 'Jamie', 'Kai', 'Lane', 'Marley',
  'Noah', 'Ocean', 'Piper', 'Quincy', 'Remy', 'Sloan', 'Teagan', 'Uma', 'Vega', 'Wren',
  'Xander', 'Yael', 'Zion', 'Aria', 'Bodhi', 'Eden', 'Sage', 'Nova', 'Orion', 'Luna',
  'Iris', 'Jude', 'Ezra', 'Ruby', 'Felix', 'Cora', 'Leo', 'Maya', 'Owen', 'Zara',
  'Miles', 'Nora', 'Theo', 'Ivy', 'Max', 'Eva', 'Sam', 'Ava', 'Jake', 'Mia',
  'Luke', 'Zoe', 'Ryan', 'Amy', 'Cole', 'Joy', 'Dean', 'Kate', 'Shane', 'Rose',
  'Brett', 'Claire', 'Troy', 'Grace', 'Kyle', 'Hope', 'Reid', 'Faith', 'Jace', 'Brooke',
  'Ty', 'Paige', 'Cade', 'Sage', 'Knox', 'Belle', 'Cruz', 'Jade', 'Reed', 'Skye'
];

const lastNames = [
  'Johnson', 'Smith', 'Brown', 'Davis', 'Wilson', 'Miller', 'Garcia', 'Rodriguez', 'Martinez', 'Anderson',
  'Thompson', 'White', 'Harris', 'Martin', 'Jackson', 'Clark', 'Lewis', 'Lee', 'Walker', 'Hall',
  'Allen', 'Young', 'Hernandez', 'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams',
  'Baker', 'Gonzalez', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell',
  'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook',
  'Morgan', 'Bell', 'Murphy', 'Bailey', 'Rivera', 'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward',
  'Torres', 'Peterson', 'Gray', 'Ramirez', 'James', 'Watson', 'Brooks', 'Kelly', 'Sanders', 'Price',
  'Bennett', 'Wood', 'Barnes', 'Ross', 'Henderson', 'Coleman', 'Jenkins', 'Perry', 'Powell', 'Long',
  'Patterson', 'Hughes', 'Flores', 'Washington', 'Butler', 'Simmons', 'Foster', 'Gonzales', 'Bryant', 'Alexander',
  'Russell', 'Griffin', 'Diaz', 'Hayes', 'Myers', 'Ford', 'Hamilton', 'Graham', 'Sullivan', 'Wallace'
];

function generateRandomName(): string {
  const firstName = getRandomItem(firstNames);
  const lastName = getRandomItem(lastNames);
  return `${firstName} ${lastName}`;
}

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomItem<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

async function seed() {
  console.log('🎵 Starting database seeding...');

  // Clear existing data
  await prisma.user.deleteMany({});
  console.log('🗑️ Cleared existing users');

  const users = [];

  for (let i = 0; i < 120; i++) {
    const userInstruments = getRandomItems(instruments, Math.floor(Math.random() * 3) + 1);
    const userGenres = getRandomItems(genres, Math.floor(Math.random() * 4) + 1);
    const name = generateRandomName();

    const user = {
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}${i}@example.com`,
      instruments: JSON.stringify(userInstruments),
      genres: JSON.stringify(userGenres),
      location: getRandomItem(locations),
      availability: getRandomItem(availabilities),
      bio: getRandomItem(bios),
      experienceLevel: getRandomItem(experienceLevels) as string,
      collaborationType: getRandomItem(collaborationTypes) as string,
    };

    users.push(user);
  }

  // Batch create users
  await prisma.user.createMany({
    data: users,
  });

  console.log(`✅ Created ${users.length} musician profiles`);

  // Display some sample data
  const sampleUsers = await prisma.user.findMany({
    take: 3,
    orderBy: { createdAt: 'asc' }
  });

  console.log('\n📋 Sample profiles created:');
  sampleUsers.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name} (${user.email})`);
    console.log(`   Instruments: ${JSON.parse(user.instruments).join(', ')}`);
    console.log(`   Genres: ${JSON.parse(user.genres).join(', ')}`);
    console.log(`   Location: ${user.location}`);
    console.log(`   Experience: ${user.experienceLevel} | Type: ${user.collaborationType}`);
    console.log('');
  });

  console.log('🎉 Database seeding completed!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });