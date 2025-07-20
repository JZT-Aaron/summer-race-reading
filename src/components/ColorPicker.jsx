import { useEffect, useState, useRef } from 'react';
import colors from '../colors.js'

export default function ColorPicker(props) {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const availableColors = props.colors;
    const currentColor = props.currentColor;
    const colorPicker = useRef(null);

    function handleCoverHover(color) {
        if(color.name === currentColor.name) return;
        toogleColorPicker();
        props.setColor(color);
    }

    useEffect(() => {
        function handleMouseDown(e) {
            if(showColorPicker && colorPicker.current && !colorPicker.current.contains(e.target)) {
                toogleColorPicker();
            }
        }

        document.addEventListener('mousedown', handleMouseDown);
        return () => document.removeEventListener('mousedown', handleMouseDown)
    }, [showColorPicker])
    



    function toogleColorPicker() {
        setShowColorPicker(prev => !prev);
    }

    const colorsElement = colors.map((color, index) => {
        return(<span key={index} className={'color' + (availableColors.some(aColor => aColor.id === color.id) ? '' : ' cross') + (currentColor.name === color.name ? " selected" : '')} style={{backgroundColor: color.hex}} onClick={() => handleCoverHover(color)} />)
    })

    return (
        <>
            <div ref={colorPicker}>
                <div className={"selected-color" + (showColorPicker ? ' selected' : '')} onClick={toogleColorPicker}></div>
                {showColorPicker && <div className='color-picker-main'>{colorsElement}</div>}
            </div>
        </>
    )
    
} 