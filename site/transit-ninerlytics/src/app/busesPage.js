const BusesPage = () => {
    const hardTempData = [
        { busID: '2401', milesDriven: '376', avgMiles: '1.0' },
        { busID: '2402', milesDriven: '487', avgMiles: '1.3' },
        { busID: '2403', milesDriven: '442', avgMiles: '1.2' },
        { busID: '2404', milesDriven: '195', avgMiles: '0.5' },
        { busID: '2405', milesDriven: '239', avgMiles: '0.7' },
        { busID: '2406', milesDriven: '459', avgMiles: '1.3' },
        { busID: '2407', milesDriven: '512', avgMiles: '1.4' },
        { busID: '2408', milesDriven: '253', avgMiles: '0.7' },
        { busID: '2409', milesDriven: '297', avgMiles: '0.8' },
        { busID: '2410', milesDriven: '247', avgMiles: '0.7' },
        { busID: '2411', milesDriven: '301', avgMiles: '0.8' },
        { busID: '2412', milesDriven: '267', avgMiles: '0.7' },
        { busID: '2413', milesDriven: '165', avgMiles: '0.5' }
    ]



    return (

        <table class='table table-striped'>
        <caption align="top">Bus Info Data</caption>
        <thead>
            <tr>
                <th scope='col'>Bus ID</th>
                <th scope='col'>Miles Driven</th>
                <th scope='col'>Average Miles Driven / Day</th>
            </tr>
        </thead>
        <tbody>
            {hardTempData.map(thing => (
                <tr  key={thing.name}>
                    <td>{thing.busID}</td>
                    <td>{thing.milesDriven}</td>
                    <td>{thing.avgMiles}</td>
                </tr>
            ))}
        </tbody>
    </table>
    )
}

export default BusesPage