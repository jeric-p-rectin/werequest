import clientPromise from '../app/lib/mongodb';
import fs from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';

const PASSWORD = "$2b$10$WFevh1ozem7Qs.dWD40v1.c4wZsY5Bk.VF6VLUTAilXbSKupRGioG";
const USERS_JSON = path.join(__dirname, 'users-data.json');

// Helper: Generate random data for residents
function randomFrom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const firstNames = ["Alex", "Jamie", "Taylor", "Jordan", "Morgan", "Casey", "Riley", "Avery", "Peyton", "Skyler", "Drew", "Reese", "Quinn", "Rowan", "Sawyer", "Emerson", "Finley", "Harper", "Kendall", "Logan", "Parker", "Sage", "Tatum", "Blake", "Cameron", "Dakota", "Elliot", "Hayden", "Jesse", "Kai", "Lane", "Micah", "Noel", "Oakley", "Phoenix", "Remy", "Shiloh", "Teagan", "Val", "Wren", "Zion"];
const middleNames = ["Lee", "Ann", "Marie", "James", "Ray", "Jean", "Lynn", "Grace", "John", "Paul", "Mae", "Lou", "Dale", "Jude", "Kai", "Rae", "Jay", "Blair", "Drew", "Rey", "Skye", "Tate", "Wynn", "Beau", "Blue", "Cruz", "Dane", "Eden", "Fox", "Gale", "Hope", "Jace", "Kane", "Lane", "Mack", "Nash", "Oak", "Pax", "Quinn", "Reed", "Shay", "Tess"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green"];
const extNames = ["", "Jr.", "Sr.", "III", "IV", ""];
const birthPlaces = ["Manila", "Quezon City", "Cebu City", "Davao City", "Baguio", "Iloilo", "Bacolod", "Cagayan de Oro", "Zamboanga", "Taguig", "Pasig", "Makati", "Marikina", "San Juan", "Mandaluyong", "Paranaque", "Cavite", "Laguna", "Batangas", "Pampanga"];
const puroks = ["purok1", "purok2", "purok3", "purok4", "purok5", "purok6", "purok7"];
const genders = ["male", "female"];
const civilStatuses = ["single", "married", "widow", "separated"];
const religions = ["Catholic", "Iglesia", "Born Again", "Muslim", "INC", "Baptist", "None", "Roman Catholic"];
const workingStatuses = ["employed", "unemployed", "self-employed"];
const sourcesOfIncome = ["Farming", "Business", "Remittance", "Pension", "Employment", "None", "Other"];
const votingStatuses = ["registered", "not-registered"];
const educationalAttainments = ["elementary", "highschool", "vocational", "college", "postgraduate"];
const pwdTypes = [
  "Visual Disability", "Hearing Disability", "Speech and Language Disability", "Orthopedic Disability", "Mental Disability", "Psychosocial Disability", "Learning Disability", "Multiple Disabilities", "Chronic Illness", "Others"
];

function generateUsername(firstName: string, middleName: string, lastName: string, birthday: Date) {
  return `${firstName.slice(0, 3).toUpperCase()}${middleName ? middleName.slice(0, 2).toUpperCase() : 'XX'}${lastName.slice(0, 3).toUpperCase()}${birthday.getDate().toString().padStart(2, '0')}${birthday.getFullYear().toString().slice(-2)}`;
}

function generateEmail(firstName: string, lastName: string, n: number) {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${n}@example.com`;
}

// Resident type definition
interface Resident {
  username: string;
  role: "resident";
  createdAt: Date;
  updatedAt: Date;
  firstName: string;
  middleName: string;
  lastName: string;
  extName: string;
  fullName: string;
  birthday: Date;
  birthPlace: string;
  age: number;
  gender: "male" | "female";
  civilStatus: "single" | "married" | "widow" | "separated";
  nationality: string;
  religion: string;
  email: string;
  password: string;
  phoneNumber: string;
  houseNo: string;
  purok: "purok1" | "purok2" | "purok3" | "purok4" | "purok5" | "purok6" | "purok7";
  workingStatus: "employed" | "unemployed" | "self-employed";
  sourceOfIncome: string;
  votingStatus: "registered" | "not-registered";
  educationalAttainment: "elementary" | "highschool" | "vocational" | "college" | "postgraduate";
  soloParent: boolean;
  fourPsBeneficiary: boolean;
  pwd: boolean;
  pwdType: "Visual Disability" | "Hearing Disability" | "Speech and Language Disability" | "Orthopedic Disability" | "Mental Disability" | "Psychosocial Disability" | "Learning Disability" | "Multiple Disabilities" | "Chronic Illness" | "Others" | null;
}

async function main() {
  // Load existing users
  const existingUsers = JSON.parse(fs.readFileSync(USERS_JSON, 'utf-8'));
  const existingUsernames = new Set(existingUsers.map((u: any) => u.username));
  const existingEmails = new Set(existingUsers.map((u: any) => u.email));

  const newResidents: Resident[] = [];
  let tries = 0;
  let created = 0;
  while (created < 40 && tries < 400) {
    tries++;
    // Generate random but unique names
    const firstName = randomFrom(firstNames);
    const middleName = randomFrom(middleNames);
    const lastName = randomFrom(lastNames);
    const extName = randomFrom(extNames);
    // Age 13-80
    const age = Math.floor(Math.random() * (80 - 13 + 1)) + 13;
    const birthday = randomDate(new Date(1940, 0, 1), new Date(Date.now() - age * 365.25 * 24 * 60 * 60 * 1000));
    const birthPlace = randomFrom(birthPlaces);
    const gender = randomFrom(genders) as Resident["gender"];
    const civilStatus = randomFrom(civilStatuses) as Resident["civilStatus"];
    const nationality = "Filipino";
    const religion = randomFrom(religions);
    const email = generateEmail(firstName, lastName, created + 1000);
    const phoneNumber = `09${Math.floor(100000000 + Math.random() * 900000000)}`;
    const houseNo = `${Math.floor(Math.random() * 9999)}`;
    const purok = randomFrom(puroks) as Resident["purok"];
    const workingStatus = randomFrom(workingStatuses) as Resident["workingStatus"];
    const sourceOfIncome = randomFrom(sourcesOfIncome);
    const votingStatus = randomFrom(votingStatuses) as Resident["votingStatus"];
    const educationalAttainment = randomFrom(educationalAttainments) as Resident["educationalAttainment"];
    const soloParent = Math.random() < 0.3;
    const fourPsBeneficiary = Math.random() < 0.2;
    const pwd = Math.random() < 0.15;
    const pwdType = pwd ? randomFrom(pwdTypes) as Resident["pwdType"] : null;
    const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
    const username = generateUsername(firstName, middleName, lastName, birthday);
    if (existingUsernames.has(username) || existingEmails.has(email) || newResidents.some(u => u.username === username || u.email === email)) {
      continue;
    }
    const now = new Date();
    newResidents.push({
      username,
      role: "resident",
      createdAt: now,
      updatedAt: now,
      firstName,
      middleName,
      lastName,
      extName,
      fullName,
      birthday,
      birthPlace,
      age,
      gender,
      civilStatus,
      nationality,
      religion,
      email,
      password: PASSWORD,
      phoneNumber,
      houseNo,
      purok,
      workingStatus,
      sourceOfIncome,
      votingStatus,
      educationalAttainment,
      soloParent,
      fourPsBeneficiary,
      pwd,
      pwdType
    });
    created++;
  }

  if (newResidents.length !== 40) {
    console.error('Could not generate 40 unique residents. Generated:', newResidents.length);
    process.exit(1);
  }

  // Insert into MongoDB
  const client = await clientPromise;
  const db = client.db('WeRequestDB');
  await db.collection('users').insertMany(newResidents);
  console.log('Inserted', newResidents.length, 'new residents.');
}

main().catch(console.error);
