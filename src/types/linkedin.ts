// LinkedIn-specific types and filter mappings

export interface SearchFilters {
    keywords?: string;
    location?: string;
    datePosted?: 'any-time' | 'past-month' | 'past-week' | 'past-24-hours';
    experienceLevel?: ('internship' | 'entry-level' | 'associate' | 'mid-senior' | 'director' | 'executive')[];
    jobType?: ('full-time' | 'part-time' | 'contract' | 'temporary' | 'volunteer' | 'internship' | 'other')[];
    remote?: ('on-site' | 'remote' | 'hybrid')[];
}

// LinkedIn filter parameter mappings
export const LinkedInFilters = {
    datePosted: {
        'any-time': '',
        'past-month': 'r2592000',
        'past-week': 'r604800',
        'past-24-hours': 'r86400',
    },
    experienceLevel: {
        internship: '1',
        'entry-level': '2',
        associate: '3',
        'mid-senior': '4',
        director: '5',
        executive: '6',
    },
    jobType: {
        'full-time': 'F',
        'part-time': 'P',
        contract: 'C',
        temporary: 'T',
        volunteer: 'V',
        internship: 'I',
        other: 'O',
    },
    remote: {
        'on-site': '1',
        remote: '2',
        hybrid: '3',
    },
};
