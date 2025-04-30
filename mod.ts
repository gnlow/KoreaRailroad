import { parse, Folder, Placemark } from "https://denopkg.com/gnlow/kml.ts@0.1.0/mod.ts"

using file = await Deno.open("./temp/k.kml")

const document = parse(file)

interface Info {
    path: string
}

const makeInfo =
(path: string[]) =>
({ name }: Placemark): Info => ({
    path: path.slice(1).join("/")+"/"+name,
})

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

console.log(result)
