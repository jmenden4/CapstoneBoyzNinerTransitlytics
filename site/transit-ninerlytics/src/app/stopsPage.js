import { useEffect, useContext, useState, useRef } from 'react'
import Col from 'react-bootstrap/Col'
import Dropdown from 'react-bootstrap/Dropdown'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'

import { TileLayer, MapContainer, Popup, CircleMarker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import {useSearchParams, useNavigate, createSearchParams} from 'react-router-dom'
import {AppContext} from '../App'
import Gradient from '../gradient'
import THSortable from './tables'
import { dateToISO, timeToHHMMSS, daysBetween } from '../utility'

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
    const [searchParams, setSearchParams] = useSearchParams()
    const {dataFilter, stopData, buses, routes, stops, sendNotification} = useContext(AppContext)
    
    const [sortState, setSortState] = useState({
        key: 'value',
        ascending: false,
    })

    const mapRef = useRef(null)
    const markerRefs = useRef({})


    // get current data type/item
    const dataType = searchParams.get("data")
    const currentItem = sidebar.find(x => x.key === dataType)

    // navigate to a default datatype when url isn't valid
    useEffect(() => {
        if(currentItem == null) {
            setSearchParams(params => [...params.entries(), ['data', 'num_people_on']], {replace: true})
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
                if(isNaN(x.relativeValue)) {
                    x.relativeValue = 0
                }
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

    // when export button clicked
    const onExportClick = async e => {
        // get stops in order
        const sortedStops = [...stops].sort((a, b) => a.name.localeCompare(b.name))
        
        const {minDate, maxDate, minTime, maxTime} = dataFilter
        // calculate number of days
        const numDays = daysBetween(minDate, maxDate) + 1
        
        // include header with parameters of filter
        let csvData = 'Transit Ninerlytics Export\n'
        csvData += `Dates: ${dateToISO(minDate)} - ${dateToISO(maxDate)} (${numDays} days)\n`
        csvData += `Times: ${timeToHHMMSS(minTime)} - ${timeToHHMMSS(maxTime)}\n`
        csvData += `Routes: ${routes.filter(x => dataFilter.routes.includes(x.id)).map(x => x.name).sort()}\n`
        csvData += `Buses: ${buses.filter(x => dataFilter.buses.includes(x.id)).map(x => x.code).sort()}\n`
        csvData += '\n'
        
        // add data column headers
        csvData += [
            'Stop Name',
            'Latitude',
            'Longitude',
            'TotalPeopleOn',
            'TotalPeopleOff',
            'NumTimesStopped',
            'AvgWaitTime (days)',
            'MinWaitTime (days)',
            'MaxWaitTime (days)',
        ].join('\t') + '\n'

        // get all stop data organized by stop id
        const allDataByStop = {}
        stopData.forEach(x => {
            allDataByStop[x.id] = x
        })

        // add each stop's data
        sortedStops.forEach(stop => {
            // get this stops data
            const data = allDataByStop[stop.id]
            // start with stop information
            let values = [
                stop.name,
                stop.latitude,
                stop.longitude,
            ]
            if(data != null) {
                // add actual data values for this stop
                values = values.concat(
                    data.total_people_on,
                    data.total_people_off,
                    data.num_times_stopped,
                    data.avg_wait_time / 60 / 60 / 24,
                    data.min_wait_time / 60 / 60 / 24,
                    data.max_wait_time / 60 / 60 / 24,
                )
            } else {
                // add empty space because no data
                values = values.concat(
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                )
            }
            // add to csv data
            csvData += values.join('\t') + '\n'
        })

        // copy to clipboard
        try {
            await navigator.clipboard.writeText(csvData)
            sendNotification('success', 'Success', 'Data copied to clipboard!')
        } catch(err) {
            // console.info(err)
            sendNotification('error', 'Error', 'Could not copy to clipboard!')
        }
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
                    // maxBounds={[
                    //     [35.295594, -80.754391],
                    //     [35.318172, -80.715042],
                    // ]}
                    ref={map => mapRef.current = map}
                >
                    <TileLayer 
                        // attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
                        // url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
                        url="http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
                    />
                    {mapOrderStops.map((x, i) => {
                        const stopData = dataByStop[x.id]
                        let markerAttrs = {}
                        let dataContent = null
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
                            dataContent = (
                                <div>N/A</div>
                            )
                        } else {
                            markerAttrs = {
                                pathOptions: {
                                    fillColor: stopData.color,
                                    fillOpacity: 1,
                                    weight: 0,
                                },
                                radius: 12,
                            }
                            dataContent = (
                                <div>{stopData.text}</div>
                            )
                        }
                        return (
                            <CircleMarker
                                key={x.id}
                                ref={elem => markerRefs.current[x.id] = elem}
                                center={[x.latitude, x.longitude]}
                                {...markerAttrs}
                            >
                                <Popup>
                                    <div className="fw-bold mb-1">{x.name}</div>
                                    {dataContent}
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
                    <Table className="table-fixed-head table-hover">
                        <thead>
                            <tr>
                                <th>#</th>
                                <THSortable name="Bus Stop" sortKey="name" defaultAscending sortState={sortState} setSortState={setSortState}/>
                                <THSortable name="Value" sortKey="value" defaultAscending sortState={sortState} setSortState={setSortState}/>
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

                                const onClick = e => {
                                    // get reference to leaflet map
                                    const map = mapRef.current
                                    if(!map)
                                        return
                                    // get reference to marker
                                    const marker = markerRefs.current[x.id]
                                    if(!marker)
                                        return
                                    // center on marker
                                    // map.flyTo([x.latitude, x.longitude], map.zoom)
                                    marker.openPopup()
                                }

                                return (
                                    <tr key={i} style={{
                                        cursor: 'pointer',
                                    }} onClick={onClick}>
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
            <div className="export-container position-absolute bottom-0 mb-3">
                <Button 
                    disabled={stopData == null}
                    onClick={onExportClick}>Export</Button>
            </div>
        </>
    )
}

export default StopsPage