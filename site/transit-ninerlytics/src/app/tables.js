const THSortable = ({className, name, sortKey, defaultAscending, sortState, setSortState, alignRight}) => {
    let sortIcon = null

    const _defaultAscending = defaultAscending || false
    const _alignRight = alignRight || false

    const isSorting = sortState.key == sortKey
    if(isSorting) {
        sortIcon = (
            <span className="material-symbols-sharp">{sortState.ascending ? 'arrow_drop_down' : 'arrow_drop_up'}</span>
        )
    }

    const onClick = e => {
        setSortState({
            key: sortKey,
            ascending: isSorting ? !sortState.ascending : _defaultAscending,
        })
    }

    return (
        <th className={className} onClick={onClick} style={{
            cursor: 'pointer',
        }}>
            {_alignRight ? (
                <div className="d-flex position-relative justify-content-end">
                    {sortIcon}
                    {name}
                </div>
            ) : (
                <div className="d-flex position-relative">
                    {name}
                    {sortIcon}
                </div>
            )}
        </th>
    )
}

export default THSortable