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

const entriesMap =
<V, O>
(f: (v: V) => O) =>
(obj: Record<string, V>) =>
    Object.fromEntries(
        Object.entries(obj || {})
            .map(([k, v]) => [k, f(v)])
    )

const makeInfo =
([_, type, ...path]: string[]) =>
({ name, Region }: Placemark): Path | Point => {
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
        } as Path
    }

    if (type == "Point") {
        const [category, state] = path
        const [owner, line] = path.slice(-2)

        const {north, east, west, south} = entriesMap(Number)(
            Region?.LatLonAltBox as unknown as Record<string, string>
        )

        return {
            type,
            category,
            state,
            owner,
            line,
            name,

            long: (east + west) / 2,
            lat: (north + south) / 2,
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

console.log(
    stringify(["state", "line", "name"], "\t\t\t")(result.filter(x => 1
        && x.type == "Path"
        && !x.line.endsWith("선")
    ))
)

await Deno.writeTextFile("./temp/path.tsv",
    stringify(["state", "line", "name"])(result.filter(x => x.type == "Path"))
)

await Deno.writeTextFile("./temp/point.tsv",
    stringify([
        "state",
        "line",
        "name",
        "long",
        "lat",
    ])(result.filter(x => x.type == "Point"))
)
