import { connect } from 'react-redux';
import PluginSwitch from './PluginSwitch.js';
import OHIF from 'ohif-core';

const { setLayout } = OHIF.redux.actions;

const mapStateToProps = state => {
  const { activeViewportIndex, layout, viewportSpecificData } = state.viewports;

  return {
    activeViewportIndex,
    viewportSpecificData,
    layout,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setLayout: async data => {
      dispatch(setLayout(data));
    },
    setLayoutAndViewportData: (layout, viewportSpecificData) => {
      dispatch({
        type: 'SET_LAYOUT_AND_VIEWPORT_DATA',
        layout,
        viewportSpecificData
      });
    }
  };
};

function setSingleLayoutData(originalArray, viewportIndex, data) {
  const viewports = originalArray.slice();
  const layoutData = Object.assign({}, viewports[viewportIndex], data);

  viewports[viewportIndex] = layoutData;

  return viewports;
}

const mergeProps = (propsFromState, propsFromDispatch, ownProps) => {
  const { activeViewportIndex, layout, viewportSpecificData } = propsFromState;
  const { setLayout, setLayoutAndViewportData } = propsFromDispatch;

  const setViewportToVTK = (viewportIndex) => new Promise((resolve, reject) => {
      const currentData = layout.viewports[viewportIndex];
      if (currentData && currentData.plugin === 'vtk') {
        throw new Error('Should not have reached this point??');
        //resolve();
      }

      const data = {
        plugin: 'vtk',
        vtk: {
          mode: 'mpr', // TODO: not used
          afterCreation: (api) => {
            console.warn('Passing back API!');
            resolve(api);
          }
        },
      };

      const layoutData = setSingleLayoutData(
        layout.viewports,
        viewportIndex,
        data
      );

      setLayout({ viewports: layoutData });
  });

  const setMPRLayout = (displaySet) => new Promise((resolve, reject) => {
    let viewports = [];
    const rows = 1;
    const columns = 3;
    const numViewports = rows * columns;
    const viewportSpecificData = {};
    for (let i = 0; i < numViewports; i++) {
      viewports.push({
        height: `${100 / rows}%`,
        width: `${100 / columns}%`,
      });

      viewportSpecificData[i] = displaySet;
      viewportSpecificData[i].plugin = 'vtk';
    }
    const layout = {
      viewports,
    };

    const viewportIndices = [0, 1, 2];
    let updatedViewports = layout.viewports;

    const apis = [];
    viewportIndices.forEach(viewportIndex => {
      apis[viewportIndex] = null
      const currentData = layout.viewports[viewportIndex];
      if (currentData && currentData.plugin === 'vtk') {
        reject(new Error('Should not have reached this point??'));
      }

      const data = {
        plugin: 'vtk',
        vtk: {
          mode: 'mpr', // TODO: not used
          afterCreation: (api) => {
            debugger;
            console.warn(`Passing back API! - ${viewportIndex}`);
            apis[viewportIndex] = api;

            if (apis.every(a => !!a)) {
              resolve(apis);
            }
          }
        },
      };

      updatedViewports = setSingleLayoutData(
        updatedViewports,
        viewportIndex,
        data
      );
    });

    setLayoutAndViewportData({ viewports: updatedViewports }, viewportSpecificData);
  });

  // TODO: Do not display certain options if the current display set
  // cannot be displayed using these view types
  const buttons = [
    {
      text: 'Acquired',
      type: 'command',
      icon: 'bars',
      active: false,
      onClick: () => {
        console.warn('Original Acquisition');

        const layoutData = setSingleLayoutData(
          layout.viewports,
          activeViewportIndex,
          { plugin: 'cornerstone' }
        );

        setLayout({ viewports: layoutData });
      },
    },
    {
      text: 'Axial',
      icon: 'cube',
      active: false,
      onClick: async () => {
        console.warn('Axial');

        let api = viewportSpecificData[activeViewportIndex].vtkApi;

        if (!api) {
          api = await setViewportToVTK(activeViewportIndex);
        }

        const renderWindow = api.genericRenderWindow.getRenderWindow()
        const istyle = renderWindow.getInteractor().getInteractorStyle();
        istyle.setSliceNormal(0, 0, 1);

        // TODO: put this somewhere else
        api.volumes[0].getMapper().setSampleDistance(5.0)

        renderWindow.render();
      },
    },
    {
      text: 'Sagittal',
      icon: 'cube',
      active: false,
      onClick: async () => {
        console.warn('Sagittal');

        let api = viewportSpecificData[activeViewportIndex].vtkApi;

        if (!api) {
          api = await setViewportToVTK(activeViewportIndex);
        }

        const renderWindow = api.genericRenderWindow.getRenderWindow()
        const istyle = renderWindow.getInteractor().getInteractorStyle();
        istyle.setSliceNormal(0, 1, 0);

        // TODO: put this somewhere else
        api.volumes[0].getMapper().setSampleDistance(5.0)

        renderWindow.render();
      },
    },
    {
      text: 'Coronal',
      icon: 'cube',
      active: false,
      onClick: async () => {
        console.warn('Coronal');

        let api = viewportSpecificData[activeViewportIndex].vtkApi;

        console.warn(viewportSpecificData)
        console.warn(layout);

        if (!api) {
          console.warn('Setting viewport to VTK Extension');

          api = await setViewportToVTK(activeViewportIndex);
        }
        console.warn('Applying Camera Changes');

        const renderWindow = api.genericRenderWindow.getRenderWindow()
        const istyle = renderWindow.getInteractor().getInteractorStyle();
        istyle.setSliceNormal(1, 0, 0);

        api.volumes[0].getMapper().setSampleDistance(5.0)

        renderWindow.render();
      },
    },
    {
      text: '2D MPR',
      icon: 'cube',
      active: false,
      onClick: async () => {
        console.warn('2D MPR');
        console.warn('getting apis')

        const displaySet = viewportSpecificData[activeViewportIndex];
        console.warn(displaySet);

        let apiByViewport;
        try {
          apiByViewport = await setMPRLayout(displaySet);
        } catch (error) {
          throw new Error(error);
        }

        debugger;
        console.warn(apiByViewport);

        apiByViewport.forEach((api, index) => {
          const renderWindow = api.genericRenderWindow.getRenderWindow()
          const istyle = renderWindow.getInteractor().getInteractorStyle();

          switch (index) {
            default:
            case 0:
              istyle.setSliceNormal(1, 0, 0);
              break;
            case 1:
              istyle.setSliceNormal(0, 1, 0);
              break;
            case 2:
              istyle.setSliceNormal(0, 0, 1);
          }

          renderWindow.render();
        });
      },
    },
    /*{
      text: '3D',
      icon: `#cube`,
      onClick: (click) => {
        console.warn('3D Perspective');
        const data = {
          plugin: 'vtk',
          vtk: {
            mode: '3d',
          }
        };

        const layoutData = setSingleLayoutData(layout.viewports, activeViewportIndex, data);

        setLayout({ viewports: layoutData });
      }
    }*/
  ];

  return {
    buttons,
  };
};

const ConnectedPluginSwitch = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(PluginSwitch);

export default ConnectedPluginSwitch;
