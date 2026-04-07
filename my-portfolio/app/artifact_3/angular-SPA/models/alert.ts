export interface Alert {
    _id: string, //Internal primary key in MongoDB
    source: String,
    source_port: String,
    destination: String,
    destination_port: String,
    category: String,
    reported: Date,
}