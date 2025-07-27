export default function Alert({message, title, undertitle, iconClass, setError}) {
    return (
        <div className="alert-box">
            <div className="content">
                <h2 className="title"><i className={iconClass}></i>{title}</h2>
                <h3>{undertitle}</h3>
                <p className="message">{message}</p>
                <button className="close" onClick={() => setError(null)}>Close</button>
            </div>
        </div>
    )
}