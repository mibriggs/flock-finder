export class EBirdEntry {
    submissionId: string;
    commonName: string;
    // scientificName?: string; // TODO not optional
    // taxonomicOrder?: number; // TODO not optional
    count: number;
    stateOrProvince: string;
    // county?: string;
    locationId: string;
    location: string;
    lattitude: number;
    longitude: number;
    // date?: Date; // also has a time but i think this encompasses that? // TODO not optional
    // protocol?: string; // TODO not optional
    // durationInMinutes?: number;
    // allObsReported?: number; // TODO not optional
    // distanceTraveledInKm?: number;
    // areaCovered?: number;
    // numObservers?: number; // TODO not optional
    // breedingCode?: string;
    // observationDetails?: string;
    // checklistComments?: string;
    // mlCatalogNumber?: number;

    constructor(submissionId: string, commonName: string, count: number, stateOrProvince: string,
        locationId: string, location: string, lattitude: number, longitude: number
    ) {
        this.submissionId = submissionId;
        this.commonName = commonName;
        this.count = count;
        this.stateOrProvince = stateOrProvince;
        this.locationId = locationId;
        this.location = location;
        this.lattitude = lattitude;
        this.longitude = longitude;
    }
}