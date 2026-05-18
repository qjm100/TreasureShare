package com.ruoyi.web.controller.toy;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.toy.domain.ToyCart;
import com.ruoyi.toy.service.IToyCartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 购物车Controller
 *
 * @author Ciami
 */
@RestController
@RequestMapping("/api/toy/cart")
public class CartController extends BaseController
{
    @Autowired
    private IToyCartService cartService;

    /**
     * 获取购物车列表
     */
    @GetMapping
    public AjaxResult list()
    {
        return success(cartService.selectCartList());
    }

    /**
     * 新增购物车记录
     */
    @PostMapping
    public AjaxResult add(@RequestBody ToyCart cart)
    {
        return toAjax(cartService.insertCart(cart));
    }

    /**
     * 修改购物车记录
     */
    @PutMapping("/{id}")
    public AjaxResult edit(@PathVariable Long id, @RequestBody ToyCart cart)
    {
        cart.setId(id);
        return toAjax(cartService.updateCart(cart));
    }

    /**
     * 删除购物车记录
     */
    @DeleteMapping("/{id}")
    public AjaxResult remove(@PathVariable Long id)
    {
        return toAjax(cartService.deleteCartById(id));
    }
}
