/**
 * author :tsm
 * frida -Uf YOUR_package name  -l .\index.js --no-pause
 * libcocos2djs.so是在Activity中调用的，所以hook时机为相应so加载完成的地方
 */
function hook_cocoscreator_xxteakey() {
    Java.perform(function () {
        var cocoslib_addr = Module.getBaseAddress("libcocos2djs.so");
        console.log("libcocos2djs address is: ", cocoslib_addr);

        //TODO 0x7FA3D4是jsb_set_xxtea_key的偏移地址
        //通过nm name.so | grep jsb_set_xxtea找到的，也可以通过IDA等工具查看
        //用python实现查找so符号，即可实现通用.参考https://github.com/eliben/pyelftools/wiki/User's-guide看能不能实现
        var set_xxteakey_func_addr = cocoslib_addr.add(0x7FA3D4);
        console.log("set_xxteakey_func address is: ", set_xxteakey_func_addr);

        Interceptor.attach(set_xxteakey_func_addr, {
            onEnter: function (args) {
                console.log("========== onEnter xxtea set key function =============")
                console.log("key is:", ptr(args[1]).readCString() || "args is null");
            },
            onLeave: function (ret) {
                console.log("========== onLevel =============")
            }
        })
    })
}

function hookCocosActivityLoadNativeLibraries() {
    Java.perform(function () {
        var SystemClass = Java.use("org.cocos2dx.lib.Cocos2dxActivity");
        var onLoadNativeLibraries = SystemClass.onLoadNativeLibraries;
        onLoadNativeLibraries.implementation = function () {
            console.log("enter load native library")
            this.onLoadNativeLibraries();
            
            hook_cocoscreator_xxteakey();
        }
    })
}

setImmediate(hookCocosActivityLoadNativeLibraries);