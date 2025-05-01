// deno-lint-ignore-file no-explicit-any

import { parse, Folder, Placemark } from "https://denopkg.com/gnlow/kml.ts@0.1.0/mod.ts"

using file = await Deno.open("./temp/k.kml")

const document = parse(file)

type Info = Path | Point

interface Path {
    type: "Path"
    continent: string
    country: string
    state: string
    
    owner: string
    line: string
    name: string

    coords: [number, number][]
}

interface Point {
    type: "Point"
    category: string
    state: string
    
    owner: string
    line: string
    name: string

    long: number
    lat: number
}

const makeInfo =
([_, type, ...path]: string[]) =>
({ name, LineString, Point }: Placemark): Path | Point => {
    if (type == "Path") {
        const [continent, country, state] = path
        const [owner, line] = path.slice(-2)
        return {
            type,
            continent,
            country,
            state,
            owner,
            line,
            name,

            coords: LineString!.coordinates
                .split(" ")
                .map(x => x.split(",").slice(0, 2).map(Number)),
        } as Path
    }

    if (type == "Point") {
        const [category, state] = path
        const [owner, line] = path.slice(-2)

        const [long, lat] = Point!.coordinates
            .split(",")
            .map(Number)|| []

        return {
            type,
            category,
            state,
            owner,
            line,
            name,

            long,
            lat,
        } as Point
    }
    console.log(type)
    throw 0
}

const walk =
(path: string[]) =>
({
    name,
    Folder = [],
    Placemark = [],
}: Folder): Info[] => [
    ...Folder.flatMap(walk([...path, name])),
    ...Placemark.map(makeInfo([...path, name])),
]

const result = walk([])(document)

import { stringify as _stringify } from "https://esm.sh/jsr/@std/csv@1.0.6"

const stringify =
(columns: string[], separator = "\t") =>
(data: any) =>
    _stringify(data, {
        columns,
        separator,
    })

/*
console.log(
    stringify(["state", "line", "name"], "\t\t\t")(result.filter(x => 1
        && x.type == "Path"
        && !x.line.endsWith("선")
    ))
)
*/

await Deno.writeTextFile("./temp/path.tsv",
    stringify([
        "state",
        "line",
        "name",
        "coords",
    ])(result.filter(x => x.type == "Path"))
)

await Deno.writeTextFile("./temp/point.tsv",
    stringify([
        "category",
        "state",
        "line",
        "name",
        "long",
        "lat",
    ])(result.filter(x => x.type == "Point"))
)
