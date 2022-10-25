import './App.scss'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Nav from 'react-bootstrap/Nav'
import Dropdown from 'react-bootstrap/Dropdown'
import Stack from 'react-bootstrap/Stack'

import LOGO from './resources/logo.png'
import UNCC_LOGO from './resources/UNC_Charlotte_Primary_Horiz_Logo.png'

import {BrowserRouter, Routes, Route, Navigate, Outlet} from 'react-router-dom'
import {LinkContainer} from 'react-router-bootstrap'

import StopsPage from './app/stopsPage'
import BusesPage from './app/busesPage'



const FilterMenu = () => {
    return (
        <>
            FILTER MENU
        </>
    )
}


const TimeMenu = () => {
    return (
        <>
            TIME MENU
        </>
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
                    <Dropdown>
                        <Dropdown.Toggle>
                            FILTER
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <FilterMenu/>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Dropdown>
                        <Dropdown.Toggle>
                            TIME RANGE
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <TimeMenu/>
                        </Dropdown.Menu>
                    </Dropdown>
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
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout/>}>
                    <Route index element={<Navigate to="stops" replace />} />
                    <Route path="stops" element={<StopsPage/>}/>
                    <Route path="buses" element={<BusesPage/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
