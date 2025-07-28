import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"

export default function ConfigPage() {
    const {slug} = useParams();
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API}/config/${slug}`)
        .then(res => res.json())
        .then(data => setData(data))
        .catch((err) => console.error('Loading Failed: ', err))
    }, [slug])

    if(!data) return (<p>Lade ...</p>)

    return (
        <div>
            <h1>
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </h1>
        </div>
    )
}