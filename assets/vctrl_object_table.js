window.v4ObjectTableScript = `
(function() {
    console.log("[V4 Object Table] Module initialized.");
    window.v4MessageHandlers = window.v4MessageHandlers || {};

    window.v4MessageHandlers['LF_UPDATE_CELL_STYLE'] = (d) => {
        if (window.TableManager) {
            window.TableManager.updateSelectedCellsStyle(d.style);
        }
    };

    window.v4MessageHandlers['LF_UPDATE_CELL_DIMENSION'] = (d) => {
        if (window.TableManager) {
            if (d.width !== undefined) {
                window.TableManager.updateSelectedColumnWidth(d.width);
            }
            if (d.height !== undefined) {
                window.TableManager.updateSelectedRowHeight(d.height);
            }
        }
    };
})();
`;
