package com.ruoyi.web.controller.toy;

import com.ruoyi.common.annotation.Anonymous;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.utils.file.FileUploadUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.Map;

/**
 * 文件上传Controller
 */
@RestController
@RequestMapping("/api/toy")
public class ToyUploadController extends BaseController
{
    @Anonymous
    @PostMapping("/upload")
    public AjaxResult upload(@RequestParam("file") MultipartFile file)
    {
        try
        {
            String path = FileUploadUtils.upload(file);
            // Normalize double slashes that occur when uploadDir equals profile root
            path = path.replaceAll("(?<!:)/{2,}", "/");
            Map<String, String> result = new HashMap<>();
            result.put("url", path);
            return success(result);
        }
        catch (Exception e)
        {
            return error(e.getMessage());
        }
    }
}
