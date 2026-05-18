package com.ruoyi.web.controller.toy;

import com.ruoyi.common.annotation.Anonymous;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.toy.domain.ToyCategory;
import com.ruoyi.toy.service.IToyCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * 玩具分类Controller
 *
 * @author Ciami
 */
@RestController
@RequestMapping("/api/toy/categories")
public class CategoryController extends BaseController
{
    @Autowired
    private IToyCategoryService categoryService;

    /**
     * 获取分类树
     */
    @Anonymous
    @GetMapping("/tree")
    public AjaxResult tree()
    {
        return success(categoryService.selectCategoryTree());
    }

    /**
     * 获取玩具分类列表
     */
    @GetMapping
    public TableDataInfo list(ToyCategory category)
    {
        startPage();
        List<ToyCategory> list = categoryService.selectCategoryList(category);
        return getDataTable(list);
    }

    /**
     * 获取玩具分类详细信息
     */
    @GetMapping("/{id}")
    public AjaxResult getInfo(@PathVariable Long id)
    {
        return success(categoryService.selectCategoryById(id));
    }

    /**
     * 新增玩具分类
     */
    @PostMapping
    public AjaxResult add(@RequestBody ToyCategory category)
    {
        return toAjax(categoryService.insertCategory(category));
    }

    /**
     * 修改玩具分类
     */
    @PutMapping("/{id}")
    public AjaxResult edit(@PathVariable Long id, @RequestBody ToyCategory category)
    {
        category.setId(id);
        return toAjax(categoryService.updateCategory(category));
    }

    /**
     * 删除玩具分类
     */
    @DeleteMapping("/{id}")
    public AjaxResult remove(@PathVariable Long id)
    {
        return toAjax(categoryService.deleteCategoryById(id));
    }
}
