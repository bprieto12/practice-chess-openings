output "site_url" {
  value = "https://${local.domain_name}"
}

output "bucket_name" {
  value = aws_s3_bucket.site.bucket
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.site.id
}

output "deploy_role_arn" {
  value = aws_iam_role.deploy.arn
}

output "github_variables_command" {
  description = "Run once to give the GitHub workflow what it needs (none of these are secrets)."
  value       = <<-EOT
    gh variable set AWS_DEPLOY_ROLE_ARN --repo ${var.github_repo} --body ${aws_iam_role.deploy.arn}
    gh variable set S3_BUCKET --repo ${var.github_repo} --body ${aws_s3_bucket.site.bucket}
    gh variable set CLOUDFRONT_DISTRIBUTION_ID --repo ${var.github_repo} --body ${aws_cloudfront_distribution.site.id}
  EOT
}
