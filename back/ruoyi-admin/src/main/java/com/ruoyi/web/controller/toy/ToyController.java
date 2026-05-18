package com.ruoyi.web.controller.toy;

import com.ruoyi.common.annotation.Anonymous;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.toy.domain.ToyProduct;
import com.ruoyi.toy.service.IToyProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * 玩具产品Controller
 *
 * @author Ciami
 */
@RestController
@RequestMapping("/api/toy/products")
public class ToyController extends BaseController
{
    @Autowired
    private IToyProductService productService;

    /**
     * 获取玩具产品列表
     */
    @Anonymous
    @GetMapping
    public TableDataInfo list(ToyProduct product)
    {
        startPage();
        List<ToyProduct> list = productService.selectProductList(product);
        return getDataTable(list);
    }

    /**
     * 获取玩具产品详细信息
     */
    @Anonymous
    @GetMapping("/{id}")
    public AjaxResult getInfo(@PathVariable Long id)
    {
        return success(productService.selectProductById(id));
    }

    /**
     * 新增玩具产品
     */
    @PostMapping
    public AjaxResult add(@RequestBody ToyProduct product)
    {
        return toAjax(productService.insertProduct(product));
    }

    /**
     * 修改玩具产品
     */
    @PutMapping("/{id}")
    public AjaxResult edit(@PathVariable Long id, @RequestBody ToyProduct product)
    {
        product.setId(id);
        return toAjax(productService.updateProduct(product));
    }

    /**
     * 获取当前用户的产品列表
     */
    @GetMapping("/my")
    public AjaxResult myProducts()
    {
        return success(productService.selectMyProducts());
    }

    /**
     * 删除玩具产品
     */
    @DeleteMapping("/{id}")
    public AjaxResult remove(@PathVariable Long id)
    {
        return toAjax(productService.deleteProductById(id));
    }
}
