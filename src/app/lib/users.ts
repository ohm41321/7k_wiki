// WARNING: This is a mock user store for demonstration purposes.
// Do NOT use this in a production environment.
// Passwords are not hashed and data is not persisted securely.

import fs from 'fs';
import path from 'path';

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
}

const dataDir = path.join(process.cwd(), 'data');
const usersFile = path.join(dataDir, 'users.json');

// Load users from disk if present, otherwise initialize with a default Admin user.
let users: User[] = [];
try {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (fs.existsSync(usersFile)) {
        const raw = fs.readFileSync(usersFile, 'utf8');
        users = JSON.parse(raw) as User[];
    } else {
        users = [ { id: '1', name: 'Admin', email: 'admin@example.com', password: 'password' } ];
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
    }
} catch {
    // If file IO fails, fall back to in-memory with a default user
    users = [ { id: '1', name: 'Admin', email: 'admin@example.com', password: 'password' } ];
}

function saveUsersToDisk() {
    try {
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
    } catch {
        // swallow errors for now; in production you'd log/handle this
    }
}

export const usersDB = {
    find: () => users,
    findById: (id: string) => users.find(u => u.id === id),
    findByEmail: (email: string) => users.find(u => u.email === email),
    findByUsername: (username: string) => users.find(u => u.name === username),
    create: (user: Omit<User, 'id'>) => {
        const newUser: User = { ...user, id: String(users.length + 1) };
        users.push(newUser);
        saveUsersToDisk();
        return newUser;
    }
};
