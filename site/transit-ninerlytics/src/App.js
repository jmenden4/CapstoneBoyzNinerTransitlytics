import './App.scss'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Nav from 'react-bootstrap/Nav'
import Dropdown from 'react-bootstrap/Dropdown'
import Stack from 'react-bootstrap/Stack'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import LOGO from './resources/logo.png'
import UNCC_LOGO from './resources/UNC_Charlotte_Primary_Horiz_Logo.png'
import MultiSlider from "@ptomasroos/react-native-multi-slider"


import {BrowserRouter, Routes, Route, Navigate, Outlet} from 'react-router-dom'
import {LinkContainer} from 'react-router-bootstrap'

import { createContext, useContext, useState } from 'react'

import StopsPage from './app/stopsPage'
import BusesPage from './app/busesPage'



const AppContext = createContext()




const FilterSelector = () => {
    const {filter, setFilter} = useContext(AppContext)
    const routes = ["Gold", "Silver", "Green"]
    const buses = [2401, 2402, 2403, 2404, 2405, 2406, 2407, 2408, 2409, 2410, 2411, 2412]

    const toggleRouteFilter = (key) => {
        const newRoutes = filter.routes
        const i = newRoutes.indexOf(key)
        if(i === -1) {
            newRoutes.push(key)
        } else {
            newRoutes.splice(i, 1)
        }
        setFilter({
            ...filter,
            routes: newRoutes,
        })
    }

    const toggleBusFilter = (key) => {
        const newBuses = filter.buses
        const i = newBuses.indexOf(key)
        if(i === -1) {
            newBuses.push(key)
        } else {
            newBuses.splice(i, 1)
        }
        setFilter({
            ...filter,
            buses: newBuses,
        })
    }

    const setAllRoutesFilter = value => setFilter({
        ...filter,
        routes: value ? routes : [],
    })

    const setAllBusesFilter = value => setFilter({
        ...filter,
        buses: value ? buses : [],
    })

    return (
        <Dropdown>
            <Dropdown.Toggle>
                Filter
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Form className="px-2">
                    <Stack direction="horizontal" className="mb-2">
                        <label className="flex-grow-1">Routes</label>
                        <Button variant="link" size="sm" onClick={e => setAllRoutesFilter(true)}>All</Button>
                        <Button variant="link" size="sm" onClick={e => setAllRoutesFilter(false)}>None</Button>
                    </Stack>
                    {routes.map(x => (
                        <Form.Check key={x} label={x} checked={filter.routes.includes(x)} onChange={e => toggleRouteFilter(x)}/>
                    ))}
                    <Stack direction="horizontal" className="my-2">
                        <label className="flex-grow-1">Buses</label>
                        <Button variant="link" size="sm" onClick={e => setAllBusesFilter(true)}>All</Button>
                        <Button variant="link" size="sm" onClick={e => setAllBusesFilter(false)}>None</Button>
                    </Stack>
                    {buses.map(x => (
                        <Form.Check key={x} label={x} checked={filter.buses.includes(x)} onChange={e => toggleBusFilter(x)}/>
                    ))}
                </Form>
            </Dropdown.Menu>
        </Dropdown>
    );
}

const TimeSelector = () => {

    const sliderConverter = (value) => {
        return value === 0
          ? "12am"
          : (value < 13 ? value : value - 12) + (value < 12 ? "am" : "pm");
      }

    const range = {min: 0, max: 24}
    const Slider = 12

    const startTimeSlider = ({}) => {

        const {startMin, startMax} = range;
        const [startTime, setStartTime] = useState(null)
        const [barWidth, setBarWidth] = useState(150)

        if (!startTime) {
            setStartTime([startMin]); 
        }

        const bar = (event) => {
            setBarWidth(event.nativeEvent.Layout.width - Slider * 2)
        }

    const selectedStartTimes = (values) => {
            setStartTime(values)
    }

    return (
        <View bar={bar} style={styles.wrapper}>
        <MultiSlider
                                min={startMin}
                                max={startMax}
                                allowOverlap
                                values={startTime}
                                sliderLength={barWidth}
                                selectedStartTimes={selectedStartTimes}
                                enableLabel={true}
                                trackStyle={{
                                height: 6,
                                borderRadius: 5,
                                }}
                                markerOffsetY={1}
                                selectedStyle={{
                                backgroundColor: $primary,
                                }}
                                unselectedStyle={{
                                backgroundColor: "#FFFFFF",
                                }}/>
        </View>
    )
    }



    const endTimeSlider = ({}) => {

        const {endMin, endMax} = range;
        const [endTime, setEndTime] = useState(null)
        const [barWidth, setBarWidth] = useState(150)

        if (!endTime) {
            setEndTime([endMax]); 
        }
        const bar = (event) => {
            setBarWidth(event.nativeEvent.Layout.width - Slider * 2)
        }
    
        const selectedEndTimes = (values) => {
                setEndTime(values)
        }

        return (

            <View bar={bar} style={styles.wrapper}>
            <MultiSlider
                                min={endMin}
                                max={endMax}
                                allowOverlap
                                values={endTime}
                                sliderLength={barWidth}
                                selectedEndTimes={selectedEndTimes}
                                enableLabel={true}
                                customLabel
                                trackStyle={{
                                height: 6,
                                borderRadius: 5,
                                }}
                                markerOffsetY={1}
                                selectedStyle={{
                                backgroundColor: $primary,
                                }}
                                unselectedStyle={{
                                backgroundColor: "#FFFFFF",
                                }}/>

            </View>
        )
    }
    return (
        <Dropdown>
            <Dropdown.Toggle>
                TIME RANGE
            </Dropdown.Toggle>
            <Dropdown.Menu>
                    <Form className="px-2">
                    <Stack direction="horizontal" className="mb-2">
                        <label className="flex-grow-1">Start Time</label>
                        
                                <startTimeSlider/>
                    </Stack>
                    <Stack direction="horizontal" className="my-2">
                        <label className="flex-grow-1">End Time</label>
                    
                                <endTimeSlider />
                    </Stack>
                    </Form>

       </Dropdown.Menu>
       </Dropdown>
    );
}




const NavigationBar = () => {
    return (
        <Row className="border-bottom py-2 align-items-end">
            <Col>
                <div className="d-flex align-items-center pb-2">
                    <img src={LOGO} style={{
                        width: "48px",  
                    }}/>
                    <div className="h4 mx-2 m-0">
                        TRANSIT NINERLYTICS&#8482;
                    </div>
                </div>
                <Nav variant="pills" className="">
                    <Nav.Item>
                        <LinkContainer to="/stops">
                            <Nav.Link>Stops</Nav.Link>
                        </LinkContainer>
                    </Nav.Item>
                    <Nav.Item>
                        <LinkContainer to="/buses">
                            <Nav.Link>Buses</Nav.Link>
                        </LinkContainer>
                    </Nav.Item>
                </Nav>
            </Col>
            <Col>
                <Stack direction="horizontal" gap={2} className="justify-content-center">
                    <FilterSelector/>
                    <TimeSelector/>
                </Stack>
            </Col>
            <Col className="align-self-center d-flex justify-content-end">
                <img src={UNCC_LOGO} style={{
                    width: "200px",  
                }}/>
            </Col>       
        </Row>
    )
}


const Layout = () => {
    return (
        <Container fluid className="h-100 d-flex flex-column">
            <NavigationBar/>
            <Row className="flex-grow-1 overflow-hidden">
                <Outlet/>
            </Row>
        </Container>
    )
}


const App = () => {
    const [filter, setFilter] = useState({
        routes: ["Gold", "Silver"],
        buses: [2405, 2406, 2408],
    })

    return (
        <BrowserRouter>
            <AppContext.Provider value={{filter, setFilter}}>
                <Routes>
                    <Route path="/" element={<Layout/>}>
                        <Route index element={<Navigate to="stops" replace />} />
                        <Route path="stops" element={<StopsPage/>}/>
                        <Route path="buses" element={<BusesPage/>}/>
                    </Route>
                </Routes>
            </AppContext.Provider>
        </BrowserRouter>
    )
}

export default App
