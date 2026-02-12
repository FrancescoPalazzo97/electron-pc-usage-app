export const Header = () => {
    return (
        <header>
            <button id='minimize' onClick={() => window.electron.sendFrameAction("MINIMIZE")} />
            <button id='maximize' onClick={() => window.electron.sendFrameAction("MAXIMIZE")} />
            <button id='close' onClick={() => window.electron.sendFrameAction("CLOSE")} />
        </header>
    );
};
