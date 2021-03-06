import gql from 'graphql-tag';

const getAnimeCharacters = id => gql`
    {
        queryAnime(filter: {id: {eq: "${id}"}}) {
            id
            names @cascade {
                text
                localization(filter: {id: {eq: "en-US"}}) {
                    id
                }
            }
            starring {
                relation
                character  {
                    ...on Character {
                        id
                        images(first: 1) {
                            image {
                                file {
                                    publicUri
                                }
                            }
                        }
                        names @cascade {
                            text
                            localization {
                                id
                            }
                        }
                    }
                }
            }
            images(first: 1) {
                type
                image {
                    file {
                        publicUri
                    }
                }
            }
        } 
    }
`;

export default getAnimeCharacters;
