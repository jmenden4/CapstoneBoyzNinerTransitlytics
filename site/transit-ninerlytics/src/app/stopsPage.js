import { useEffect, useContext, useState} from 'react'
import Col from 'react-bootstrap/Col'
import Dropdown from 'react-bootstrap/Dropdown'
import Table from 'react-bootstrap/Table'
import Container from 'react-bootstrap/Container'

import { TileLayer, MapContainer, Popup, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import {useSearchParams, useNavigate, createSearchParams} from 'react-router-dom'
import {AppContext} from '../App.js'
import Gradient from '../gradient'


// This code allows the map icons to be displayed properly
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})



const formatAsTime = minutes => {
    const x = Math.round(minutes)
    const h = Math.floor(x / 60)
    const m = x % 60
    let value = ''
    if(h != 0)
        value += `${h}h`
    if(m != 0 || h == 0) {
        if(h != 0)
            value += ' '
        value += `${m}m`
    }
    return value
}


const intensityGradient = new Gradient(['003f5c', '7a5195', 'ef5675', 'ffa600'])
const goodBadGradient = new Gradient(['21de54', 'f7f71b', 'ed7f1f', 'de0000'])

const colorValueLog = x => Math.log10(x * 9 + 1)

// datatypes to display in sidebar dropdown
const sidebar = [
    {
        name: "# People On",
        key: "num_people_on",
        dataFunc: x => {
            const value = x.total_people_on
            return {
                value,
                text: value.toLocaleString(),
            }
        },
        gradient: intensityGradient,
        colorIntensity: colorValueLog,
        textLight: x => true,
    },
    {
        name: "# People Off",
        key: "num_people_off",
        dataFunc: x => {
            const value = x.total_people_off
            return {
                value,
                text: value.toLocaleString(),
            }
        },
        gradient: intensityGradient,
        colorIntensity: colorValueLog,
        textLight: x => true,
    },
    {
        name: "# Times Stopped",
        key: "times_stopped",
        dataFunc: x => {
            const value = x.num_times_stopped
            return {
                value,
                text: value.toLocaleString(),
            }
        },
        gradient: intensityGradient,
        colorIntensity: colorValueLog,
        textLight: x => true,
    },
    {
        name: "Avg Wait Time",
        key: "avg_wait",
        dataFunc: x => {
            const value = x.avg_wait_time / 60
            // const value = Math.random() * 60 * 2
            return {
                value,
                text: formatAsTime(value),
            }
        },
        relativeValue: x => Math.min(x / (60 * 1.5), 1),
        gradient: goodBadGradient,
        textLight: x => x >= 0.75 / 1.5,
    },
    {
        name: "Min Wait Time",
        key: "min_wait",
        dataFunc: x => {
            const value = x.min_wait_time / 60
            return {
                value,
                text: formatAsTime(value),
            }
        },
        relativeValue: x => Math.min(x / (60 * 1.5), 1),
        gradient: goodBadGradient,
        textLight: x => x >= 0.75 / 1.5,
    },
    {
        name: "Max Wait Time",
        key: "max_wait",
        dataFunc: x => {
            const value = x.max_wait_time / 60
            return {
                value,
                text: formatAsTime(value),
            }
        },
        relativeValue: x => Math.min(x / (60 * 1.5), 1),
        gradient: goodBadGradient,
        textLight: x => x >= 0.75 / 1.5,
    },
]


const StopsPage = () => {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const {stopData, stops} = useContext(AppContext)
    
    const [sortState, setSortState] = useState({
        key: 'value',
        ascending: false,
    })



    // const silverStops = [
    //     {name: "CRI Deck", coordinates : [35.30938358719176, -80.74409858438285]},
    //     {name: "PORTAL West", coordinates : [35.311166425714845, -80.74309119066538]},
    //     {name: "Duke Centennial Hall", coordinates : [35.312275560658485, -80.74171216290172]},
    //     {name: "Motorsports", coordinates : [35.312771671084825, -80.74087731356276]},
    //     {name: "Grigg Hall", coordinates : [35.31090025814201, -80.74143211010274]},
    //     {name: "EPIC South", coordinates : [35.30996020304562, -80.74187143463637]},
    //     {name: "EPIC North", coordinates : [35.30933857063632, -80.74128080195656]},
    //     {name: "Athletics Complex East", coordinates : [35.30741935281708, -80.73988584702033]},
    //     {name: "Athletics Complex West", coordinates : [35.307458413222164, -80.7397411751955]},
    //     {name: "Student Union East", coordinates : [35.308060699267486, -80.73274516428042]},
    //     {name: "Student Union West", coordinates : [35.30812148949453, -80.73274781880963]},
    //     {name: "Science Building", coordinates : [35.308119390946324, -80.73025654343755]},
    //     {name: "Auxiliary Services", coordinates : [35.308045806331585, -80.7303587428002]},
    //     {name: "Fretwell North", coordinates : [35.30765161640449, -80.72930091303427]},
    //     {name: "East Deck 2", coordinates : [35.30637358299596, -80.72683883748046]},
    //     {name: "Lot 5A", coordinates : [35.30720130469629, -80.72535893761899]},
    //     {name: "Lot 6", coordinates : [35.30885855044208, -80.72513197539772]},
    //     {name: "Martin Hall", coordinates : [35.310273149797986, -80.72663576601944]},
    //     {name: "Student Health North", coordinates : [35.31056565203801, -80.72928365859717]},
    // ]

    // const greenStops =[
    //     {name: "North Deck", coordinates : [35.313523023768376, -80.73186053793945]},
    //     {name: "FM/PPS", coordinates : [35.31163105173394, -80.73036976608972]},
    //     {name: "Student Health North", coordinates : [35.31056565203801, -80.72928365859717]},
    //     {name: "CRI Deck", coordinates : [35.30938358719176, -80.74409858438285]},
    //     {name: "Auxiliary Services", coordinates : [35.308045806331585, -80.7303587428002]},
    //     {name: "Student Union East", coordinates : [35.308060699267486, -80.73274516428042]},
    //     {name: "Belk Hall South", coordinates : [35.31026567976137, -80.73618830264014]},
    //     {name: "Light Rail West", coordinates : [35.311967197044865, -80.73345935789352]},
    //     {name: "Fretwell North", coordinates : [35.30765161640449, -80.72930091303427]},
    //     {name: "Fretwell South", coordinates : [35.306962925780596, -80.72949808068901]},
    //     {name: "Cato Hall North", coordinates : [35.304994539433814, -80.72803359081144]},
    //     {name: "Cato Hall South", coordinates : [35.304982698139135, -80.72832123239246]},
    //     {name: "Robinson Hall South", coordinates : [35.30360768117603,-80.72940317356793]},
    //     {name: "Robinson Hall North", coordinates : [35.30330747260982,-80.72946011784032]},
    //     {name: "Gage Undergraduate Admissions Center", coordinates : [35.30206588871275,-80.73277894684313]},
    //     {name: "South Village Deck", coordinates : [35.30104831342556,-80.73588459985244]},
    //     {name: "Alumni Way East", coordinates : [35.30255936678476,-80.73764403185845]},
    //     {name: "Cone Deck", coordinates : [35.304299176948426,-80.73456758103977]},
    //     {name: "Reese West", coordinates : [35.304437475393854,-80.73278186706179]},
    // ]


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

    
    const dataByStop = {}
    if(stopData != null) {
        // evaluate to get information from data
        stopData.forEach(x => {
            dataByStop[x.id] = currentItem.dataFunc(x)
        })

        if(currentItem.relativeValue) {
            // use item relative value function
            Object.values(dataByStop).forEach(x => {
                x.relativeValue = currentItem.relativeValue(x.value)
            })
        } else {
            // calculate relative to others
            // get min/max of values
            const values = Object.values(dataByStop).map(x => x.value)
            const minValue = Math.min(...values)
            const maxValue = Math.max(...values)
            Object.values(dataByStop).forEach(x => {
                // assign as percentage of min/max range
                x.relativeValue = (x.value - minValue) / (maxValue - minValue)
            })
        }

        // assign colors
        Object.values(dataByStop).forEach(x => {
            let value = x.relativeValue
            if(currentItem.colorIntensity)
                value = currentItem.colorIntensity(value)
            x.color = currentItem.gradient.colorAt(value)
        })
    }
    
    
    // stops sorted for display on map
    const mapOrderStops = [...stops].sort((a, b) => {
        const aData = dataByStop[a.id]
        const bData = dataByStop[b.id]
        if(!aData)
            return -1
        if(!bData)
            return 1
        return aData.value - bData.value
    })


    // stops sorted for data table
    const tableOrderStops = [...stops].sort((a, b) => {
        const aData = dataByStop[a.id]
        const bData = dataByStop[b.id]
        // default by name
        let delta = a.name.localeCompare(b.name)
        // consider specific key
        switch(sortState.key) {
            case 'value': {
                // ensure has data is always first, no data always last
                if(!aData && bData) {
                    return 1
                } else if(aData && !bData) {
                    return -1
                } else if(aData && bData) {
                    delta = aData.value - bData.value
                }
            }
        }
        // consider direction
        return sortState.ascending ? delta : -delta
    })


    const THSortable = ({name, sortKey, defaultAscending}) => {
        let sortIcon = null

        const isSorting = sortState.key == sortKey
        if(isSorting) {
            sortIcon = (
                <span className="material-symbols-sharp" style={{
                    position: 'absolute',
                }}>{sortState.ascending ? 'arrow_drop_down' : 'arrow_drop_up'}</span>
            )
        }

        const onClick = e => {
            setSortState({
                key: sortKey,
                ascending: isSorting ? !sortState.ascending : defaultAscending,
            })
        }

        return (
            <th onClick={onClick} style={{
                cursor: 'pointer',
            }}>
                {name}
                {sortIcon}
            </th>
        )
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
                    {mapOrderStops.map((x, i) => {
                        const stopData = dataByStop[x.id]
                        let markerAttrs = {}
                        if(!stopData) {
                            markerAttrs = {
                                pathOptions: {
                                    color: '#000',
                                    fillColor: '#fff',
                                    fillOpacity: 1,
                                    weight: 2,
                                },
                                radius: 8,
                            }
                        } else {
                            markerAttrs = {
                                pathOptions: {
                                    fillColor: stopData.color,
                                    fillOpacity: 1,
                                    weight: 0,
                                },
                                radius: 12,
                            }
                        }
                        return (
                            <CircleMarker
                                key={i}
                                center={[x.latitude, x.longitude]}
                                {...markerAttrs}
                            >
                                <Popup>
                                    {x.name}
                                </Popup>
                            </CircleMarker>
                        )
                    })}
                    
                </MapContainer>
            </Col>
            <div style={{
                width: '400px',
                height: '100%',
            }} className="border-start d-flex flex-column p-0">
                <Dropdown className="m-2" onSelect={key => setDataType(key)} >
                    <Dropdown.Toggle className="w-100">
                        {currentItem.name}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="w-100">
                    {sidebar.map(x => (
                        <Dropdown.Item key={x.key} eventKey={x.key} active={x.key === dataType}>{x.name}</Dropdown.Item>
                    ))}
                    </Dropdown.Menu>
                </Dropdown>
                <div className="flex-grow-1 border-top" style={{
                    overflowY: 'scroll',
                }}>
                    <Table className="table-fixed-head">
                        <thead>
                            <tr>
                                <th>#</th>
                                <THSortable name="Bus Stop" sortKey="name" defaultAscending={true}/>
                                <THSortable name="Value" sortKey="value" defaultAscending={false}/>
                            </tr>
                        </thead>
                        <tbody>
                            {tableOrderStops.map((x, i) => {
                                const xData = dataByStop[x.id]
                                let dataContent = '-'
                                if(xData != null) {
                                    dataContent = (
                                        <div className="fw-bold text-center" style={{
                                            borderRadius: '0.375rem',
                                            backgroundColor: xData.color,
                                            // color: xData.relativeValue < 0.5 ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)',
                                            color: currentItem.textLight(xData.relativeValue) ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.4)',
                                        }}>{xData.text}</div>
                                    )
                                }

                                return (
                                    <tr key={i}>
                                        <td>{i+1}</td>
                                        <td>{x.name}</td>
                                        <td className="text-end">{dataContent}</td>    
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                </div>
            </div>
        </>
    )
}

export default StopsPage