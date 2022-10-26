import { useEffect } from 'react'
import Col from 'react-bootstrap/Col'
import Dropdown from 'react-bootstrap/Dropdown'

import {MapContainer} from 'react-leaflet/MapContainer'
import {TileLayer} from 'react-leaflet/TileLayer'

import {useSearchParams, useNavigate, createSearchParams} from 'react-router-dom'


const StopsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()

    const dataType = searchParams.get("data")
    
    useEffect(() => {
        if(dataType === null) {
            navigate({
                pathname: "/stops",
                search: `?${createSearchParams({
                    data: "DEFAULT_DATA",
                })}`,
                replace: true,
            })
        }
    }, [])

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
                <Dropdown onSelect={key => setDataType(key)}>
                    <Dropdown.Toggle className="w-100">
                        {dataType}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="w-100">
                        <Dropdown.Item style={{ backgroundColor: '#08874C', color: 'white' }} eventKey="Avg Wait Time">Avg Wait Time</Dropdown.Item>
                        <Dropdown.Item style={{ backgroundColor: '#08874C', color: 'white' }} eventKey="Min / Max Wait Time">Min / Max Wait Time</Dropdown.Item>
                        <Dropdown.Item style={{ backgroundColor: '#08874C', color: 'white' }} eventKey="# People On" active># People On</Dropdown.Item>
                        <Dropdown.Item style={{ backgroundColor: '#08874C', color: 'white' }} eventKey="# People Off" active># People Off</Dropdown.Item>
                        <Dropdown.Item style={{ backgroundColor: '#08874C', color: 'white' }} eventKey="# Times Stopped" active># Times Stopped</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </>
    )
}

export default StopsPage