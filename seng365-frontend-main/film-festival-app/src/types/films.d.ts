type Film = {
    /**
     * ID number of the film in the database
     */
    filmId: number;
    /**
     * Title of the film
     */
    title: string;
    /**
     * The id corresponding to the genre.
     */
    genreId: number;
    /**
     * The id of the director, corresponding to the users table.
     */
    directorId: number;
    /**
     * Director's first name
     */
    directorFirstName: string;
    /**
     * The directors last name
     */
    directorLastName: string;
    /**
     * The recommended age rating
     */
    ageRating: string;
    /**
     * Average rating given by reviewers
     */
    rating: number;
    /**
     * The date the film was released.
     */
    releaseDate: string;
    /**
     * Description of film
     */
    description: string;
    runtime: number;
}

type Genre = {
    genreId: number;
    name: string;
}

type Review = {
    reviewerId: number;
    rating: number;
    review: string;
    reviewerFirstName: string;
    reviewerLastName: string;
    timestamp: string;
}

type User = {
    email: string;
    firstName: string;
    lastName: string;
}

type PatchUser = {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    currentPassword: string;
}

type Review = {
    rating: Number;
    review: string;
}