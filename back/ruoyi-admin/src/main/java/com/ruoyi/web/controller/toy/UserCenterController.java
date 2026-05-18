package com.ruoyi.web.controller.toy;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.toy.domain.ToyAddress;
import com.ruoyi.toy.domain.ToyUser;
import com.ruoyi.toy.service.IToyAddressService;
import com.ruoyi.toy.service.IToyUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 用户中心Controller
 *
 * @author Ciami
 */
@RestController
@RequestMapping("/api/toy")
public class UserCenterController extends BaseController
{
    @Autowired
    private IToyUserService userService;

    @Autowired
    private IToyAddressService addressService;

    /**
     * 获取当前用户信息
     */
    @GetMapping("/user/profile")
    public AjaxResult getProfile()
    {
        return success(userService.getCurrentUser());
    }

    /**
     * 修改用户信息
     */
    @PutMapping("/user/profile")
    public AjaxResult updateProfile(@RequestBody ToyUser user)
    {
        return toAjax(userService.updateUser(user));
    }

    /**
     * 获取收货地址列表
     */
    @GetMapping("/addresses")
    public AjaxResult listAddresses()
    {
        return success(addressService.selectAddressList());
    }

    /**
     * 获取收货地址详细信息
     */
    @GetMapping("/addresses/{id}")
    public AjaxResult getAddress(@PathVariable Long id)
    {
        return success(addressService.selectAddressById(id));
    }

    /**
     * 新增收货地址
     */
    @PostMapping("/addresses")
    public AjaxResult addAddress(@RequestBody ToyAddress address)
    {
        return toAjax(addressService.insertAddress(address));
    }

    /**
     * 修改收货地址
     */
    @PutMapping("/addresses/{id}")
    public AjaxResult editAddress(@PathVariable Long id, @RequestBody ToyAddress address)
    {
        address.setId(id);
        return toAjax(addressService.updateAddress(address));
    }

    /**
     * 删除收货地址
     */
    @DeleteMapping("/addresses/{id}")
    public AjaxResult removeAddress(@PathVariable Long id)
    {
        return toAjax(addressService.deleteAddressById(id));
    }

    /**
     * 根据昵称搜索用户
     */
    @GetMapping("/user/search")
    public AjaxResult searchUsers(@RequestParam String username)
    {
        return success(userService.searchByNickName(username));
    }
}
