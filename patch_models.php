<?php

$models = ['AdvancePayment', 'SalaryRecord'];
foreach ($models as $modelName) {
    if (!file_exists('app/Models/' . $modelName . '.php')) {
        continue;
    }
    
    $content = file_get_contents('app/Models/' . $modelName . '.php');
    if (strpos($content, 'BelongsToShop') !== false) {
        continue;
    }

    $content = str_replace(
        "use Illuminate\Database\Eloquent\Model;",
        "use Illuminate\Database\Eloquent\Model;\nuse App\Traits\BelongsToShop;",
        $content
    );

    $content = preg_replace(
        '/class ' . $modelName . ' extends Model\s*\{/',
        "class " . $modelName . " extends Model\n{\n    use BelongsToShop;\n",
        $content
    );
    
    file_put_contents('app/Models/' . $modelName . '.php', $content);
    echo "Patched {$modelName}\n";
}
echo "Done!\n";
