import { parse, Folder, Placemark } from "https://denopkg.com/gnlow/kml.ts@0.1.0/mod.ts"

using file = await Deno.open("./temp/k.kml")

const document = parse(file)

type Info = Path | Point

interface Path {
    continent: string
    country: string
    state: string
    
    owner: string
    line: string
    name: string
}

interface Point {
    category: string
    state: string
    
    owner: string
    line: string
    name: string
}

const makeInfo =
([_, type, ...path]: string[]) =>
({ name }: Placemark): Path | Point => {
    if (type == "Path") {
        const [continent, country, state] = path
        const [owner, line] = path.slice(-2)
        return {
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
        return {
            category,
            state,
            owner,
            line,
            name,
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
    .filter(x => 1
        //&& x.data[0] == "Point"
    )

import { stringify } from "https://esm.sh/jsr/@std/csv@1.0.6"

await Deno.writeTextFile("./temp/k.tsv",
    stringify(result as any, {
        columns: ["line", "name"],
        separator: "\t",
    })
)
