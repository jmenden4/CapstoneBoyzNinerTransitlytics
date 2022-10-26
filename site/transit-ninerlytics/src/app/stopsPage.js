import { useEffect } from 'react'
import Col from 'react-bootstrap/Col'
import Dropdown from 'react-bootstrap/Dropdown'

import {MapContainer} from 'react-leaflet/MapContainer'
import {TileLayer} from 'react-leaflet/TileLayer'

import {useSearchParams, useNavigate, createSearchParams} from 'react-router-dom'


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