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

import {BrowserRouter, Routes, Route, Navigate, Outlet} from 'react-router-dom'
import {LinkContainer} from 'react-router-bootstrap'

import { createContext, useContext, useState } from 'react'

import StopsPage from './app/stopsPage'
import BusesPage from './app/busesPage'
import DropdownItem from 'react-bootstrap/esm/DropdownItem'



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
    return (
        <Dropdown>
            <Dropdown.Toggle>
                TIME RANGE
            </Dropdown.Toggle>
            <Dropdown.Menu>
                
            </Dropdown.Menu>
        </Dropdown>
    )
}

const DateSelector = () => {
    const years = [2018, 2019, 2020]
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


    const [valueFM, setValueFM]=useState(months[0]);
    const handleSelectFM=(e)=>{
        console.log(e)
        setValueFM(e)
    }

    const [valueFY, setValueFY]=useState(years[0]);
    const handleSelectFY=(e)=>{
        console.log(e)
        setValueFY(e)
    }

    const [valueTM, setValueTM]=useState(months[11]);
    const handleSelectTM=(e)=>{
        console.log(e)
        setValueTM(e)
    }

    const [valueTY, setValueTY]=useState(years[2]);
    const handleSelectTY=(e)=>{
        console.log(e)
        setValueTY(e)
    }

    

    return (
        <Dropdown autoClose = "outside">
            <Dropdown.Toggle>
                Date
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Form className='px-4'>
                    <Stack direction = "horizontal" className = "firstdate">
                            <input className='day-form' type="number" name="count" id="count" min="1" max="31" placeholder="Day"></input>
                    <Dropdown onSelect={handleSelectFM}>        
                            <Dropdown.Toggle className = "date-btn" style={{ backgroundColor: '#ffff', color: '#08874C'}} >
                            {valueFM}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                            {months.map((month, index) => (
                                    <Dropdown.Item eventKey={month} key={index}>{month}</Dropdown.Item>))}
                            </Dropdown.Menu>
                    </Dropdown>
                    <Dropdown onSelect={handleSelectFY}>
                            <Dropdown.Toggle className = "date-btn" style={{ backgroundColor: '#ffff', color: '#08874C'}}>
                                {valueFY}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {years.map((year) => (
                                    <Dropdown.Item eventKey={year} key={year.toString()}>{year}</Dropdown.Item>))}
                            </Dropdown.Menu>
                    </Dropdown>    
                    </Stack>
                    <Stack direction = "horizontal" className = "lastdate">
                    <input className='day-form' type="number" name="count" id="count" min="1" max="31" placeholder="Day"></input>
                    <Dropdown onSelect={handleSelectTM}>        
                            <Dropdown.Toggle className = "date-btn" style={{ backgroundColor: '#ffff', color: '#08874C'}} >
                            {valueTM}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                            {months.map((month, index) => (
                                    <Dropdown.Item eventKey={month} key={index}>{month}</Dropdown.Item>))}
                            </Dropdown.Menu>
                    </Dropdown>
                    <Dropdown onSelect={handleSelectTY}>
                            <Dropdown.Toggle className = "date-btn" style={{ backgroundColor: '#ffff', color: '#08874C'}}>
                                {valueTY}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {years.map((year) => (
                                    <Dropdown.Item eventKey={year} key={year.toString()}>{year}</Dropdown.Item>))}
                            </Dropdown.Menu>
                    </Dropdown>
                    </Stack>
                </Form>
            </Dropdown.Menu>
        </Dropdown>
    )
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
                    <DateSelector/>
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
