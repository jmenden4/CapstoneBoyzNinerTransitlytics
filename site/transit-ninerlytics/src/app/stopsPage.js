import { useEffect } from 'react'
import Col from 'react-bootstrap/Col'
import Dropdown from 'react-bootstrap/Dropdown'

import { TileLayer, MapContainer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import {useSearchParams, useNavigate, createSearchParams} from 'react-router-dom'



// This code allows the map icons to be displayed properly
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})




const StopsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()

    
    // datatypes to display in sidebar dropdown
    const sidebar = [
        {
            name: "# People On",
            key: "num_people_on",
        },
        {
            name: "# People Off",
            key: "num_people_off",
        },
        {
            name: "# Times Stopped",
            key: "times_stopped",
        },
        {
            name: "Avg Wait Time",
            key: "avg_wait",
        },
        {
            name: "Min / Max Wait Time",
            key: "min_max_wait",
        },
    ]


    const silverStops = [
        {name: "CRI Deck", coordinates : [35.30938358719176, -80.74409858438285]},
        {name: "PORTAL West", coordinates : [35.311166425714845, -80.74309119066538]},
        {name: "Duke Centennial Hall", coordinates : [35.312275560658485, -80.74171216290172]},
        {name: "Motorsports", coordinates : [35.312771671084825, -80.74087731356276]},
        {name: "Grigg Hall", coordinates : [35.31090025814201, -80.74143211010274]},
        {name: "EPIC South", coordinates : [35.30996020304562, -80.74187143463637]},
        {name: "EPIC North", coordinates : [35.30933857063632, -80.74128080195656]},
        {name: "Athletics Complex East", coordinates : [35.30741935281708, -80.73988584702033]},
        {name: "Athletics Complex West", coordinates : [35.307458413222164, -80.7397411751955]},
        {name: "Student Union East", coordinates : [35.308060699267486, -80.73274516428042]},
        {name: "Student Union West", coordinates : [35.30812148949453, -80.73274781880963]},
        {name: "Science Building", coordinates : [35.308119390946324, -80.73025654343755]},
        {name: "Auxiliary Services", coordinates : [35.308045806331585, -80.7303587428002]},
        {name: "Fretwell North", coordinates : [35.30765161640449, -80.72930091303427]},
        {name: "East Deck 2", coordinates : [35.30637358299596, -80.72683883748046]},
        {name: "Lot 5A", coordinates : [35.30720130469629, -80.72535893761899]},
        {name: "Lot 6", coordinates : [35.30885855044208, -80.72513197539772]},
        {name: "Martin Hall", coordinates : [35.310273149797986, -80.72663576601944]},
        {name: "Student Health North", coordinates : [35.31056565203801, -80.72928365859717]},
    ]

    const greenStops =[
        {name: "North Deck", coordinates : [35.313523023768376, -80.73186053793945]},
        {name: "FM/PPS", coordinates : [35.31163105173394, -80.73036976608972]},
        {name: "Student Health North", coordinates : [35.31056565203801, -80.72928365859717]},
        {name: "CRI Deck", coordinates : [35.30938358719176, -80.74409858438285]},
        {name: "Auxiliary Services", coordinates : [35.308045806331585, -80.7303587428002]},
        {name: "Student Union East", coordinates : [35.308060699267486, -80.73274516428042]},
        {name: "Belk Hall South", coordinates : [35.31026567976137, -80.73618830264014]},
        {name: "Light Rail West", coordinates : [35.311967197044865, -80.73345935789352]},
        {name: "Fretwell North", coordinates : [35.30765161640449, -80.72930091303427]},
        {name: "Fretwell South", coordinates : [35.306962925780596, -80.72949808068901]},
        {name: "Cato Hall North", coordinates : [35.304994539433814, -80.72803359081144]},
        {name: "Cato Hall South", coordinates : [35.304982698139135, -80.72832123239246]},
        {name: "Robinson Hall South", coordinates : [35.30360768117603,-80.72940317356793]},
        {name: "Robinson Hall North", coordinates : [35.30330747260982,-80.72946011784032]},
        {name: "Gage Undergraduate Admissions Center", coordinates : [35.30206588871275,-80.73277894684313]},
        {name: "South Village Deck", coordinates : [35.30104831342556,-80.73588459985244]},
        {name: "Alumni Way East", coordinates : [35.30255936678476,-80.73764403185845]},
        {name: "Cone Deck", coordinates : [35.304299176948426,-80.73456758103977]},
        {name: "Reese West", coordinates : [35.304437475393854,-80.73278186706179]},
    ]


    // get current data type/item
    const dataType = searchParams.get("data")
    const currentItem = sidebar.find(x => x.key === dataType)


    // navigate to a default datatype when url isn't valid
    useEffect(() => {
        if(currentItem == null) {
            navigate({
                pathname: "/stops",
                search: `?${createSearchParams({
                    data: "avg_wait",
                })}`,
                replace: true,
            })
        }
    }, [])


    // don't show anything until we're definitely at an actual data type (after re-navigated if required)
    if(currentItem == null) {
        return null
    }

    
    const setDataType = key => {
        setSearchParams(x => {
            const params = Object.fromEntries(x)
            params.data = key
            return params
        })
    }

    console.info(silverStops, greenStops)
    // http://alexurquhart.github.io/free-tiles/
    // https://leaflet-extras.github.io/leaflet-providers/preview/
    return (
        <>
            <Col className="p-0 flex-grow-1">
                <MapContainer 
                    center={[35.306974, -80.733743]}
                    zoom={17}
                    minZoom={16}
                    maxZoom={18}
                    maxBounds={[
                        [35.295594, -80.754391],
                        [35.318172, -80.715042],
                    ]}
                >
                    <TileLayer 
                        // attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
                        // url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
                        url="http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
                    />
                    {silverStops.map((x, i) => (
                        <Marker key={i} position={[x.coordinates[0], x.coordinates[1]]}>
                            <Popup>
                                {x.name}
                            </Popup>
                        </Marker>
                    ))}
                    {greenStops.map((x, i) => (
                        <Marker key={i} position={[x.coordinates[0], x.coordinates[1]]}>
                            <Popup>
                                {x.name}
                            </Popup>
                        </Marker>
                    ))}
                    
                </MapContainer>
            </Col>
            <div style={{
                width: "300px",
            }} className="p-2 border-start">
                <Dropdown onSelect={key => setDataType(key)} >
                    <Dropdown.Toggle className="w-100">
                        {currentItem.name}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="w-100">
                    {sidebar.map(x => (
                        <Dropdown.Item key={x.key} eventKey={x.key} active={x.key === dataType}>{x.name}</Dropdown.Item>
                    ))}
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </>
    )
}

export default StopsPage